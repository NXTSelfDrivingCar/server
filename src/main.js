var dotenv = require("dotenv").config({ path: ".env" });
var { LogHandler } = require("./logging/logHandler.js");
var express = require("express");
//var filestore = require("session-file-store")(session);
var path = require("path");
var port = 5000;
var session = require("express-session");
var User = require("./user/userModel");
var userController = require("./user/userController");
var cookies = require("cookie-parser");

var logger = new LogHandler().open();

var jwt = require("jsonwebtoken");
const { jsonToString } = require("./shared/util.js");

const nonAuthRoutes = [
  "/",
  "/favicon.ico",
  "/user/login",
  "/user/register",
  "/user/logout",
];

/* 
	Routes:
	/ - test page
	/user/register - registruj korisnika
	/user/delete - obrisi korisnika
  /logout - logout i izbrisi cookie
*/

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

// Ovo se koristi zbog navbara
function checkSession(req, res) {
  if (!req.session.user) {
    req.session.user = { user_session_id: "guest" };
  }
  return req.session;
}

async function getUserFromSession(req, res) {
  //if (checkSession(req, res).user.user_session_id === "guest") {
  return new User("guest", "guest", "guest", "guest", "guest");
  //}
  //return await userController.findUserById(req.session.user.user_session_id);
}

// {
//   user: {
//     _id: '639cd95e718924fe31cb4f04',
//     id: '2d80dee6-f0f5-45b0-9cd2-6cca6fbbbdfe',
//     username: 'AnTasMes',
//     password: '123',
//     email: 'akitasevski112@gmail.com',
//     nxt_api_key: 'apikey',
//     role: 'admin'
//   },
//   iat: 1671230003,
//   exp: 1671233603
// }

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
  //res.end();
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

//Funkcija gde server dobija podatke od klijenta

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});

module.exports = server;
