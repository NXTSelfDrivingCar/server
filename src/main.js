var dotenv = require("dotenv").config({ path: ".env" });
var { LogHandler } = require("./logging/logHandler.js");
var express = require("express");
var path = require("path");
var port = 5000;
var User = require("./user/userModel");
var cookies = require("cookie-parser");

var logger = new LogHandler().open();

var jwt = require("jsonwebtoken");

function getUserWithToken(req, res) {
  console.log(" getUsersWithToken -> ");
  console.log(req.cookies.auth);

  if (req.cookies.auth) {
    var decoded = jwt.verify(req.cookies.auth, process.env.JWT_SECRET);

    var newUser = new User(
      decoded.user.username,
      decoded.user.password,
      decoded.user.email,
      decoded.user.nxt_api_key,
      decoded.user.role
    );

    return newUser;
  } else {
    return new User("guest", "guest", "guest", "guest", "guest");
  }
}

var server = express();

server.use(cookies());

server.use(express.static(path.join(__dirname, "public")));

server.use(express.urlencoded({ extended: true }));

var admin_routes = require("./routes/admin_routes")(server);
var guest_routes = require("./routes/guest_routes")(server);
var user_routes = require("./routes/user_routes")(server, getUserFromSession);

server.get("/", async (req, res) => {
  var decoded = null;

  var user = getUserWithToken(req, res);
  console.log(user);

  logger.log("INFO", "/", "GET", user.username);
  res.render("main_page_index.ejs", {
    title: "Main page",
    user: user,
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
