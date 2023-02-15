import { Authorization } from "../cookie/authorization";
import { WSClientHandler } from "./WebSocketClientHandler";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();

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

        socket.on("kickUser", (socketId: any) => {
            console.log("WebSocketAdminHandler. Kicking user: " + socketId.socketId);

            kickUser(socket, socketId, clientHandler);
            
        })
    });

    io.on("message", (message: any) => {
        console.log(message);
    });

}


function kickUser(socket:any, socketId: any, clientHandler: WSClientHandler){
    Authorization.getUserFromToken(Authorization.getTokenFromWS(socket, "auth")).then((user) => {
        var adminData = !user ? {} : {id: user.id, username: user.username, role: user.role};

        clientHandler.getClientFromSocketId(socketId).then((client) => {
            var clientData = !client ? {} : {id: client.id, username: client.username, role: client.role};

            logger.info({
                origin: "WebSocket",
                action: "kickUser",
                details: {socket: socketId},
                user: clientData,
                admin: adminData
            })

            clientHandler.disconnectClient(socketId);
        });
    });
}

