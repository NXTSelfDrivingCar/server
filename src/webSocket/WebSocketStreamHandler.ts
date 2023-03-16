
module.exports = function(io: any, socket: any){

    socket.paused = true;

    // Streamer (Android app) emits stream data to the server
    // Server emits stream data to the web client (UserId room) 
    // UserId room can be used to send stream data to a specific user
    socket.on("stream", (data: any) => {

        io.to(socket["userId"]).emit("stream", data);
    })

    socket.on("nxtControl", (data: any) => {
        console.log("Sending nxtControl to: " + socket["userId"] + " data: " + data);
        

        io.to(socket["userId"]).emit("nxtControl", data);
    })

    socket.on("pauseStream", () => {
        console.log("Pausing stream for: " + socket["userId"]);
        
        socket.paused = !socket.paused;
        socket.emit("pauseStream", {paused: socket.paused}) 
    })

}