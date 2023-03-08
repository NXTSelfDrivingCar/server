import { Authorization } from "../cookie/authorization";

// connectedClients: any = {}
// connectedClients[socketId] = {SID: socketId, UID: userId}

// tmpClients: any = {}
// tmpClients[socketId] = {socket: socket}

// streamerClients: any = {}
// streamerClients[socketId] = {SID: socketId, UID: userId}

const rooms = new Map<string, string>()
    .set("default", "user")
    .set("admin", "admin")
    .set("user", "user")
    .set("streamer", "streamer")
    .set("gps", "gps");

export class WSClientHandler{
    private static io: any;
    private static instance: WSClientHandler;

    private static connectedClients: any = {};
    private static tmpClients: any = {};
    private static streamerClients: any = {};

    private options: any = {
        connectionTimeout: 10
    };

    private constructor(io: any, options = {}){
        WSClientHandler.io = io;
        this.options = options || this.options;
    }

    // * =================== PUBLIC FUNCTIONS ===================

    public init(){
        this._init()
    }

    public static getInstance(io: any): WSClientHandler{
        if(!WSClientHandler.instance){
            WSClientHandler.instance = new WSClientHandler(io);
        }
        return WSClientHandler.instance;
    }

    public getIO(): any{
        return WSClientHandler.io;
    }

    public getConnectedClients(): any{
        return WSClientHandler.connectedClients;
    }

    public getTmpClients(): any{
        return WSClientHandler.tmpClients;
    }

    public getStreamerClients(): any{
        return WSClientHandler.streamerClients;
    }

    public getConnectedClientsBySocketId(socketId: any): any{
        return WSClientHandler.connectedClients[socketId];
    }

    public getTmpClientsBySocketId(socketId: any): any{
        return WSClientHandler.tmpClients[socketId];
    }

    public getStreamerClientsBySocketId(socketId: any): any{
        return WSClientHandler.streamerClients[socketId];
    }

    public removeClient(socketId: any){
        this._removeFromConnectedClientsBySocketId(socketId);
        this._removeFromTmpClientsBySocketId(socketId);
        this._removeFromStreamerClientsBySocketId(socketId);

        WSClientHandler.io.to("admin").emit("clientDisconnected", {SID: socketId});
    }

    public async joinRooms(socket: any, data: any){

        console.log(" | " + socket.id + " Joining room: " + data.room);
        
        this._addToTmpClients(socket);        

        // If the room is not defined, join the default room (user)
        if (!data.room || socket.rooms.has(data.room)) socket.join(rooms.get("default"));

        // If the room is admin, check if the user is authorized to join the room
        if (data.room === "admin") {

            // If the user is not authorized (or the ticket is invalid), disconnect the socket
            if (!Authorization.authorizeSocket(socket, "auth", true, "admin")) {
                socket.disconnect();
                return;
            }
        }

        // If token doesn't exist, set it to an empty string (because of streamers that have to send the token in the data)
        var token = data.token ? data.token : ""

        // Joins the room
        socket.join(rooms.get(data.room));
        await this.attachUserIdToSocket(socket, token);

        // If the room is user, add the socket to the connected clients
        this._checkInSocket(socket);
    }

    public async requestClientList(socket: any){

        // clientData format: {SID: socketId: string, UID: userId: string, Username: username: string, Role: role: string, Rooms: rooms: []}
        for(var key in WSClientHandler.connectedClients){
            socket.emit("clientList", await this._getReturnFormat(key));
        }
    }

    // ! =================== PRIVATE FUNCTIONS ===================

    private async _handleStreamer(socket: any, data: any){
        var user = await Authorization.getUserFromToken(data.token);
    }

    private async _getReturnFormat(key: any): Promise<any>{

        // Get the client data
        var clientData = this._getConnectedClient(key)
        
        // Get the user from the token
        var user = await Authorization.getUserFromToken(Authorization.getTokenFromWS(clientData.socket, "auth"));

        // Get all rooms except the socket id room
        var rooms = [...clientData.socket.rooms]
            .filter(room => room !== clientData.socket.id) 

        if(user){
            return {
                SID: clientData.SID,
                UID: clientData.UID,
                user: {
                    username: user.username,
                    role: user.role,
                    id: user.id
                },
                rooms: rooms
            }
        }

        return { SID: null, UID: null, Username: null, Role: null, Rooms: null };
    }

    private _getConnectedClient(socketId: string): any{
        return WSClientHandler.connectedClients[socketId];
    }

    private _getStreamerClient(socketId: string): any{
        return WSClientHandler.streamerClients[socketId];
    }

    private _addToConnectedClients(socket: any){
        WSClientHandler.connectedClients[socket.id] = {
            SID: socket.id,
            UID: socket["userId"],
            socket: socket
        }
    }

    private _addToTmpClients(socket: any){
        WSClientHandler.tmpClients[socket.id] = {
            SID: socket.id,
            UID: socket["userId"],
            socket: socket
        }
    }

    private _addToStreamerClients(socket: any){
        WSClientHandler.streamerClients[socket.id] = {
            SID: socket.id,
            UID: socket["userId"],
            socket: socket
        }
    }

    private _removeFromConnectedClientsBySocketId(socketId: string){
        delete WSClientHandler.connectedClients[socketId];
    }

    private _removeFromTmpClientsBySocketId(socketId: string){
        delete WSClientHandler.tmpClients[socketId];
    }

    private _removeFromStreamerClientsBySocketId(socketId: string){
        delete WSClientHandler.streamerClients[socketId];
    }

    private _removeFromConnectedClients(socket: any){
        delete WSClientHandler.connectedClients[socket.id];
    }

    private _removeFromTmpClients(socket: any){
        delete WSClientHandler.tmpClients[socket.id];
    }

    private _removeFromStreamerClients(socket: any){
        delete WSClientHandler.streamerClients[socket.id];
    }

    private _checkInSocket(socket: any){

        // If the socket is not a user, disconnect it or if it is not in any room
        if(!socket["userId"] || socket.rooms.length < 2) 
        {
            this.removeClient(socket.id);
            socket.disconnect();
            return;
        }

        if(socket.rooms.has("streamer")) this._addToStreamerClients(socket);


        // Socket cannot be a guest and not have the gps room (only GPS devices can be guests)
        if(!socket.rooms.has("gps") && socket["userId"] === "guest") 
        {   
            this.removeClient(socket.id);
            socket.disconnect();
            return;
        }

        this._addToConnectedClients(socket);
        this._removeFromTmpClients(socket);

        // Emit the client connected event to the admin room
        this._getReturnFormat(socket.id).then((data: any) => {
            WSClientHandler.io.to("admin").emit("clientConnected", data);
        });
    }

    private async attachUserIdToSocket(socket: any, token: string = ""){

        console.log("Attaching user id to socket" + socket.id + " with token: " + token);
        

        if(!token){
            token = Authorization.getTokenFromWS(socket, "auth");
        }

        var user = await Authorization.getUserFromToken(token);

        if(!socket["userId"]) socket["userId"] = user?.id;

        socket.join(user?.id)
    }

    // ? =================== INIT ===================

    private async _init(){
        WSClientHandler.io.on("requestClientList", (socket: any) => {
            console.log("Requesting client list");

            socket.send(WSClientHandler.connectedClients);
        });
    }
}