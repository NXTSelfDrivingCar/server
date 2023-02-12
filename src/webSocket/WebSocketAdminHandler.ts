import { WSClientHandler } from "./WebSocketClientHandler";

module.exports = function(io: any){

    const clientHandler = WSClientHandler.getInstance(io);

    io.on("connection",(socket: any) => {
        console.log("New client connected: " + socket.id);
        socket.on("disconnect", () => {
            console.log("Client disconnected: " + socket.id);
        });
    });
    io.on("message", (message: any) => {
        console.log(message);
    });
}