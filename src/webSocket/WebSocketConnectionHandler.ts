import { Authorization } from "../cookie/authorization";
import { LogHandler } from "../logging/logHandler";
import { WebSocket } from "./WebSocket";
import { WSClientHandler } from "./WebSocketClientHandler";

const logger = new LogHandler();


function isConnected(socket: any): boolean{
    return socket.rooms.size >= 1;
}

// TODO: Return clientHandler after Android testing

module.exports = function(io: WebSocket){

    const clientHandler = WSClientHandler.getInstance(io.getIO());

    clientHandler.init();

    io.on("connection", async(socket: any) => {
        
        console.log("WebSocketConnectionHandler. Client " + socket.id + " connecting to server ..."); 

        // Send to the client the connection has been established
        socket.send("Server has established connection with socket ID " + socket.id + "");

        // This event is emitted when the user disconnects
        socket.on("disconnect", () => {
            console.log("WebSocketConnectionHandler. Client " + socket.id + " disconnected");

            // Remove the client from the client list 
            clientHandler.removeClient(socket.id);
        });

        // This event is emitted when the user sends a message
        socket.on("message", (message: any) => {
            socket.send("Server is returning the message back: " + message);

            console.log("WebSocketConnectionHandler. Message received: " + message);
        })

        // This event is emitted when the user joins a room
        socket.on("joinRoom", (data: any) => {
            console.log("WebSocketConnectionHandler. Client joining room: " + data.room);

            socket.send("Server is joining socket to a room: " + data.room);
            
            // socket.join(data.room);
            
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


        setInterval(() => {
            if(socket.paused){
                if(socket.paused == false){
                    socket.emit("stream", "not paused")
                }
            }
        }, 5000);
    });

    io.on("message", (message: any) => {
        io.send(message)
    });

}