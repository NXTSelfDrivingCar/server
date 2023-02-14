import { Authorization } from "../cookie/authorization";

export class WSClientHandler{
    private static io: any;
    private static instance: WSClientHandler;

    private static connectedClients: any = {};
    private static tmpClients: any = {};

    private options: any = {
        connectionTimeout: 10
    };

    private constructor(io: any, options = {}){
        WSClientHandler.io = io;
        this.init()
        this.options = options || this.options;
    }

    // * =================== PUBLIC FUNCTIONS ===================

    public static getInstance(io: any): WSClientHandler{
        if(!WSClientHandler.instance){
            WSClientHandler.instance = new WSClientHandler(io);
        }
        return WSClientHandler.instance;
    }

    public resolved(socketId: any){
        if(this.getTmpCliet(socketId)){
            return false;
        }
        if(this.getConnectedClient(socketId)){
            return true;
        }
        return true
    }

    public getIO(): any{
        return WSClientHandler.io;
    }

    public getConnectedClients(): any{
        return WSClientHandler.connectedClients;
    }   
    
    public getConnectedClient(id: string): any{
        return WSClientHandler.connectedClients[id];
    }

    public getSocketRooms(id: string): any{
        return this.getConnectedClient(id).rooms;
    }

    public getSocketById(id: string): any{
        return WSClientHandler.io.sockets.sockets[id];
    }

    public disconnectClient(id: string){
        var socket = this.getConnectedClient(id);
        if(socket){ socket.disconnect(); }
    }

    public async getClientIdFromSocket(socketId: any): Promise<any>{
        // Get cookie from socket named 'auth'
        var socket = this.getConnectedClient(socketId);

        if(!socket){
            return null;
        }
    
        var token = Authorization.getTokenFromWS(socket, "auth");
        var user = await Authorization.getUserFromToken(token);

        if(!user){
            return null;
        }

        return user.id;
    }

    // ! =================== PRIVATE FUNCTIONS ===================

    private addClient(id: string, client: any){
        WSClientHandler.connectedClients[id] = client;
    }

    private removeClient(id: string){
        delete WSClientHandler.connectedClients[id];
    }

    private getTmpCliet(id: string): any{
        return WSClientHandler.tmpClients[id];
    }

    private addTmpClient(id: string, client: any){
        WSClientHandler.tmpClients[id] = client;
    }

    private removeTmpClient(id: string){
        delete WSClientHandler.tmpClients[id];
    }

    private async getSingleMapSocketIdClient(socketId: string): Promise<any> {
        var map: any = {};
        var user = await Authorization.getUserFromToken(Authorization.getTokenFromWS(WSClientHandler.connectedClients[socketId], "auth"));
        var room = await WSClientHandler.connectedClients[socketId].rooms;
        
        var rooms = [];
        for(var roomKey of room){
            if (roomKey === socketId) continue;                
            rooms.push(roomKey);
        }
        
        map[socketId] = { socketId: socketId, user: user, rooms: rooms };

        return map;
    }

    private async getMapSocketIdClient(): Promise<any> {
        var map: any = {};
        for(var key in WSClientHandler.connectedClients){

            map[key] = (await this.getSingleMapSocketIdClient(key))[key];
        }
        return map;
    }

    private init(){
        WSClientHandler.io.on("connection",(socket: any) => {
            var intervalCounter = 0;

            this.addTmpClient(socket.id, socket);

            var intervalID = setInterval(() => {
                this._handleRoomConnection(socket, intervalID, intervalCounter);
                intervalCounter++;
            }, 1000);

            socket.on("requestClientList", async () => {
                this.getMapSocketIdClient().then((map: any) => {

                    WSClientHandler.io.to(socket.id).emit("userJoined", map);
                })
            })

            socket.on("disconnect", () => {
                console.log("WebSocketClientHandler. Client disconnected: " + socket.id);

                WSClientHandler.io.to("admin").emit("userLeft", socket.id);

                this.removeClient(socket.id);
                this.removeTmpClient(socket.id);
            });
        });
    }

    private _handleRoomConnection(socket: any, intervalID: any, intervalCounter: number){
        if(socket.rooms.size > 1){
            // console.log("Client joined a room: " + socket.id + " -> ");
            // console.log(socket.rooms);
            
            this.addClient(socket.id, socket);
            this.removeTmpClient(socket.id);

            clearInterval(intervalID);

            this.getSingleMapSocketIdClient(socket.id).then((map: any) => {
                WSClientHandler.io.to("admin").emit("userJoined", map);
            })
            
            return;
        }

        // If the client hasnt sent a joinRoom event within x seconds, join the default room
        if(intervalCounter > this.options.connectionTimeout){
            console.log("Client didnt join a room within 5 seconds. Joining default room");
            socket.disconnect();
            clearInterval(intervalID);
            return;
        }
    }
}