const { WebSocket } = require("socket.io");

var { LogHandler } = require("./logging/logHandler");
var http = require("http");

var logger = new LogHandler().open();

module.exports = (server) => {
  var httpServer = http.createServer(server);

  server.io = require("socket.io")(httpServer, {
    transports: ["websocket", "polling"],
  });

  server.io.on("connection", (socket) => {
    console.log("=== One user connected ===");
    console.log("SID: " + socket.conn["id"]);

    socket.emit("message", "You have been connected");

    socket.on("disconnect", () => {
      console.log("=== One user disconnected ===");
      console.log("SID: " + socket.conn["id"]);
      // send message back to this user
      socket.emit("message", "You have been disconnected");
    });

    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on("message", (msg) => {
      console.log("Message recieved: " + msg);
    });
  });

  return httpServer;
};
