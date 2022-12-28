var dotenv = require("dotenv").config({ path: ".env" });
var { LogHandler } = require("./logging/logHandler.js");
var { getUserWithToken } = require("./public/util");
var express = require("express");
var path = require("path");
var User = require("./user/userModel");
var cookies = require("cookie-parser");
var jwt = require("jsonwebtoken");
var wildcard = require("socketio-wildcard")();

const { Server } = require("socket.io");
const serverConfig = require("./config/serverConfig");

var httpServerPort = serverConfig.HTTP_PORT;
var wsServerPort = serverConfig.WS_PORT;

var logger = new LogHandler().open();

var server = express();

server.use(cookies());

server.use("/static", express.static(path.join(__dirname, "public")));

server.use(express.urlencoded({ extended: true }));

var wsServer = require("./wsServer")(server);

var admin_routes = require("./routes/admin_routes")(server);
var guest_routes = require("./routes/guest_routes")(server);
var user_routes = require("./routes/user_routes")(server, getUserWithToken); // TODO: Skloniti getUserWithToken jer se sada nalazi u util.js

// END OF GETTING ROUTES FROM OTHER FILES

server.get("/", async (req, res) => {
  var decoded = null;

  var user = getUserWithToken(req, res);

  logger.log("info", {
    action: "getMainPage",
    url: req.url,
    method: "GET",
    serverOrigin: "HttpServer",
    user: {
      username: user.username,
      role: user.role,
      id: user.id,
    },
    sessionId: req.sessionID,
  });

  res.render("main_page_index.ejs", {
    title: "Main page",
    user: user, // Passes user for navbar and access control
    session: req.session,
  });
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

server.listen(httpServerPort, function (err) {
  if (err) {
    logger.logError({
      action: "startServer",
      details: { serverType: "HttpServer", port: wsServerPort },
      error: err,
    });
    throw err;
  }

  logger.log("info", {
    action: "startServer",
    details: { serverType: "HttpServer", port: httpServerPort },
  });
  console.log("Node.js web server at port 5000 is running.");
});

wsServer.listen(wsServerPort, function (err) {
  if (err) {
    logger.logError({
      action: "startServer",
      details: { serverType: "WebSocket", port: wsServerPort },
      error: err,
    });
    throw err;
  }

  logger.log("info", {
    action: "startServer",
    details: { serverType: "WebSocket", port: wsServerPort },
  });
  console.log("Node.js WebSocket server at port 5001 is running.");
});

module.exports = server;

// TODO: Dodati UDP i TCP;
