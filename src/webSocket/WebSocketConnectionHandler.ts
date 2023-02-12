import { LogHandler } from "../logging/logHandler";
import { WebSocket } from "./WebSocket";
import { WSClientHandler } from "./WebSocketClientHandler";

const logger = new LogHandler();

const rooms = new Map<string, string>()
    .set("default", "user")
    .set("admin", "admin")
    .set("user", "user")
    .set("stream", "stream");


function joinRoom(socket: any, data: any){
    // Set(2) { 'fXILzhQj0lYh09gvAAAB', 'user' }

    if(!data.room || !rooms.has(data.room)){
        socket.join(rooms.get("default"));
    }

    socket.join(rooms.get(data.room));
}

module.exports = function(io: WebSocket){

    const clientHandler = WSClientHandler.getInstance(io.getIO());

    io.on("connection",(socket: any) => {
        socket.on("disconnect", () => {
            console.log("Client disconnected: " + socket.id);
        });

        // Join a room 
        socket.on("joinRoom", (data: any) => {
            joinRoom(socket, data);
        });

        console.log("New client connected: " + socket.id);
        console.log(socket.rooms);
        
        // If the client hasnt sent a joinRoom event within 5 seconds, join the default room
        setTimeout(() => {
            if(socket.rooms.size < 2){
                joinRoom(socket, {room: "default"});
            }

            console.log("After 5 seconds");
            console.log(socket.rooms);

        }, 5000);

        setInterval(() => {
            var client = clientHandler.getConnectedClient(socket.id);
            clientHandler.getClientIdFromSocket(socket.id);
        }, 1000);

    });

    io.on("message", (message: any) => {
        console.log(message);
    });
}