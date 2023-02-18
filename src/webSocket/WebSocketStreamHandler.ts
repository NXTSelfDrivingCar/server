module.exports = function(io: any, socket: any){
    socket.on("stream", (data: any) => {
        console.log("Stream data: " + data);
        console.log("Sending stream to: " + socket["userId"]);
        

        io.to(socket["userId"]).emit("stream", data);
    })
}