import { Buffer } from "buffer";


module.exports = function(io: any, socket: any){

    // Streamer (Android app) emits stream data to the server
    // Server emits stream data to the web client (UserId room) 
    // UserId room can be used to send stream data to a specific user
    socket.on("stream", (data: any) => {

        io.to(socket["userId"]).emit("stream", data);


    })
}