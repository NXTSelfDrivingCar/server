import { Authorization } from "../cookie/authorization";
import { LogHandler } from "../logging/logHandler";
import { WebSocket } from "./WebSocket";
import { WSClientHandler } from "./WebSocketClientHandler";

const logger = new LogHandler();

// List of role rooms
const rooms = new Map<string, string>()
    .set("default", "user")
    .set("admin", "admin")
    .set("user", "user")
    .set("streamer", "streamer")
    .set("gps", "gps");


async function joinRoom(socket: any, data: any){
    // If the room is not defined, join the default room (user)
    if(!data.room || !rooms.has(data.room)){
        socket.join(rooms.get("default"));
    }
    
    console.log("Joining room: " + data.room);
    // If the room is admin, check if the user is authorized to join the room
    if(data.room === "admin"){
        if(! await Authorization.authorizeSocket(socket, "auth", false, "admin")){
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

    // Join the room
    socket.join(rooms.get(data.room));
}

async function atachUserIdToSocket(socket: any){
    var token = Authorization.getTokenFromWS(socket, "auth");
    var user = await Authorization.getUserFromToken(token);

    if(!socket["userId"]) socket["userId"] = user?.id;

    socket.join(user?.id)
}

async function joinRomms(socket: any, data: any){
    joinRoom(socket, data);
    atachUserIdToSocket(socket);
}

module.exports = function(io: WebSocket){

    const clientHandler = WSClientHandler.getInstance(io.getIO());

    clientHandler.init();

    io.on("connection", async(socket: any) => {

        console.log("WebSocketConnectionHandler. Client " + socket.id + " connecting to server ..."); 

        socket.on("disconnect", () => {
            console.log("WebSocketConnectionHandler. Client " + socket.id + " disconnected");

            clientHandler.removeClient(socket.id);
        });

        socket.on("joinRoom", (data: any) => {
            console.log("Joining room: " + data.room);
            
            clientHandler.joinRooms(socket, data); 
        })

        var streamHandler = require("./WebSocketStreamHandler")(io, socket);

        if(await Authorization.authorizeSocket(socket, "auth", false, "admin")){
            var adminHandler = require("./WebSocketAdminHandler")(io, socket);
        }

        setTimeout(() => {
            if(socket.rooms.size < 2){
                clientHandler.joinRooms(socket, {room: "default"});
            }
        }, 5000);
    });

    io.on("message", (message: any) => {
        io.send(message)
    });

}