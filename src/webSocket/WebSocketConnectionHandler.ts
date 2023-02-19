import { Authorization } from "../cookie/authorization";
import { LogHandler } from "../logging/logHandler";
import { WebSocket } from "./WebSocket";
import { WSClientHandler } from "./WebSocketClientHandler";

const logger = new LogHandler();


function isConnected(socket: any): boolean{
    return socket.rooms.size >= 1;
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

        // If the user is authorized as an admin, create an admin handler for the socket
        if(await Authorization.authorizeSocket(socket, "auth", false, "admin")){
            var adminHandler = require("./WebSocketAdminHandler")(io, socket);
        }


        setTimeout(() => {
            if(!isConnected(socket)) {
                return;
            }

            if(socket.rooms.size < 2){
                clientHandler.joinRooms(socket, {room: "default"});
            }
        }, 5000);
    });

    io.on("message", (message: any) => {
        io.send(message)
    });

}