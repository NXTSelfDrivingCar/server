var dotenv = require("dotenv").config({ path: ".env" });
var { LogHandler } = require("./logging/logHandler.js");
var { getUserWithToken } = require("./shared/util");
var express = require("express");
var path = require("path");
var port = 5000;
var User = require("./user/userModel");
var cookies = require("cookie-parser");
var jwt = require("jsonwebtoken");

var logger = new LogHandler().open();

var server = express();

server.use(cookies());

server.use(express.static(path.join(__dirname, "public")));

server.use(express.urlencoded({ extended: true }));

// GETTING ROUTES FROM OTHER FILES

var admin_routes = require("./routes/admin_routes")(server);
var guest_routes = require("./routes/guest_routes")(server);
var user_routes = require("./routes/user_routes")(server, getUserWithToken);

// END OF GETTING ROUTES FROM OTHER FILES

server.get("/", async (req, res) => {
  var decoded = null;

  var user = getUserWithToken(req, res);

  logger.log("INFO", "/", "GET", user.username);
  res.render("main_page_index.ejs", {
    title: "Main page",
    user: user, // Passes user for navbar and access control
    session: req.session,
  });
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});

module.exports = server;

// TODO: Dodati UDP i TCP; 
