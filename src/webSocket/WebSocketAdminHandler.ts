import { Authorization } from "../cookie/authorization";
import { WSClientHandler } from "./WebSocketClientHandler";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();

module.exports = function(io: any, socket: any){

    const clientHandler = WSClientHandler.getInstance(io);

    socket.on("kickUser", (data: any) => {
        console.log("WebSocketAdminHandler. Kicking user: " + data.socketId);

        kickUser(socket, data, clientHandler);
    })

    socket.on("requestClientList", () => {
        console.log("WebSocketAdminHandler. Requesting client list");

        clientHandler.requestClientList(socket);
    })


}


function kickUser(socket:any, data: any, clientHandler: WSClientHandler){
    var token = Authorization.getTokenFromWS(socket, "auth");
    Authorization.getUserFromToken(token).then((user) => { 
        var userData = {}

        if(user) { userData = {id: user.id, username: user.username, role: user.role} }

        logger.info({
            origin: "WebSocket",
            action: "kickUser",
            details: {socket: data.SID},
            user: userData
        })
    });

    clientHandler.removeClient(data.SID);
}

