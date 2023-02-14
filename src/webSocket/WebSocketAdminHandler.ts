import { Authorization } from "../cookie/authorization";
import { WSClientHandler } from "./WebSocketClientHandler";

module.exports = function(io: any){

    const clientHandler = WSClientHandler.getInstance(io);

    io.on("connection", async (socket: any) => {

        // If the client doesn't have the admin role, skip the socket
        if(! await Authorization.authorizeSocket(socket, "auth", true, "admin")){
            console.log("Client doesn't have admin role: " + socket.id);
            return;
        }

        console.log("WebSocketAdminHandler. Client connected: " + socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected: " + socket.id);
        });

        socket.on("kickUser", (socketId: string) => {
            console.log("WebSocketAdminHandler. Kicking user: " + socketId);
            clientHandler.disconnectClient(socketId);
        })
        
        // Ovo ne treba da se cita server-side, nego client-side
        // socket.on("roomJoined", (data: any) => {
        //     if(data.socketId){
        //         console.log("WebSocketAdminHandler. Client joined room: " + data.socketId);
        //     }

        //     if(data.rooms){
        //         console.log("WebSocketAdminHandler. Client joined rooms: " );
        //         console.log(data.rooms);
        //     }
        // })
    });

    io.on("message", (message: any) => {
        console.log(message);
    });

}

