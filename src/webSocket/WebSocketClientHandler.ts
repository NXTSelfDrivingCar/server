import { AutoEncryptionLoggerLevel } from "mongodb";
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

    public static getInstance(io: any): WSClientHandler{
        if(!WSClientHandler.instance){
            WSClientHandler.instance = new WSClientHandler(io);
        }
        return WSClientHandler.instance;
    }

    public getIO(): any{
        return WSClientHandler.io;
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

    public getConnectedClients(): any{
        return WSClientHandler.connectedClients;
    }   
    
    public getConnectedClient(id: string): any{
        return WSClientHandler.connectedClients[id];
    }

    public addClient(id: string, client: any){
        WSClientHandler.connectedClients[id] = client;
    }

    public removeClient(id: string){
        delete WSClientHandler.connectedClients[id];
    }

    private init(){
        WSClientHandler.io.on("connection",(socket: any) => {
            var intervalCounter = 0;

            console.log("WebSocketClientHandler. Client connected: " + socket.id);

            WSClientHandler.tmpClients[socket.id] = socket;

            var intervalID = setInterval(() => {
                this._handleRoomConnection(socket, intervalID, intervalCounter);
                intervalCounter++;
            }, 1000);

            socket.on("disconnect", () => {
                console.log("WebSocketClientHandler. Client disconnected: " + socket.id);
            });
        });
    }

    private _handleRoomConnection(socket: any, intervalID: any, intervalCounter: number){
        if(socket.rooms.size > 1){
            console.log("Client joined a room: " + socket.id + " -> ");
            console.log(socket.rooms);
            
            WSClientHandler.connectedClients[socket.id] = socket;
            delete WSClientHandler.tmpClients[socket.id];
            clearInterval(intervalID);
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