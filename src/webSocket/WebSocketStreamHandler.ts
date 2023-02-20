module.exports = function(io: any, socket: any){

    // Streamer (Android app) emits stream data to the server
    // Server emits stream data to the web client (UserId room) 
    // UserId room can be used to send stream data to a specific user
    socket.on("stream", (data: any) => {
        console.log("Stream data: " + data);
        console.log("Sending stream to: " + socket["userId"]);
        
        // UserId is attached to the socket when the user joins a room
        io.to(socket["userId"]).emit("stream", data);
    })
}