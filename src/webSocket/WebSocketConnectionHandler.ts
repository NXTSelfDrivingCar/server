import { Authorization } from "../cookie/authorization";
import { LogHandler } from "../logging/logHandler";
import { WebSocket } from "./WebSocket";
import { WSClientHandler } from "./WebSocketClientHandler";

const logger = new LogHandler();

const rooms = new Map<string, string>()
    .set("default", "user")
    .set("admin", "admin")
    .set("user", "user")
    .set("stream", "stream");


async function joinRoom(socket: any, data: any){

    // If the room is not defined, join the default room (user)
    if(!data.room || !rooms.has(data.room)){
        socket.join(rooms.get("default"));
    }

    // If the room is admin, check if the user is authorized to join the room
    if(data.room === "admin"){
        if(! await Authorization.authorizeSocket(socket, "auth", true, "admin")){
            socket.disconnect();
            return;    
        }
    }

    // Logs in the backgroud and does not wait for the result
    var token = Authorization.getTokenFromWS(socket, "auth");
    Authorization.getUserFromToken(token).then((user) => { 
        var userData = {}

        if(user) { userData = {id: user.id, username: user.username, role: user.role} }

        logger.info({
            origin: "WebSocket",
            action: "joinRoom",
            details: {room: data.room, socket: socket.id},
            user: userData
        })
    });

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

        // console.log("New client connected: " + socket.id);
        // console.log(socket.rooms);
        
        // If the client hasnt sent a joinRoom event within 5 seconds, join the default room
        setTimeout(() => {
            if(socket.rooms.size < 2){
                joinRoom(socket, {room: "default"});
            }

        }, 5000);
    });

    io.on("message", (message: any) => {
        console.log(message);
    });
}