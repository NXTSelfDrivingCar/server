
var userController = require("./user/userController");
var User = require("./user/userModel");
var port = 5000;
var express = require("express");
var session = require("express-session");
var filestore = require("session-file-store")(session);
var path = require("path");

/* 
	Routes:
	/ - test page
	/user/register - register a user
	/user/delete - delete a user
*/

function printMainPage(req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });

  res.write("<html><body><p>This is home page.</p></body></html>");
  res.end();
}
// register i delete vrlo mogu da se spoje kasnije
// Ovo je ostavljeno sada ovako da bi se lakse razumelo
function registerUser(req, res) {
  parseUser(req, res).then((userData) => {
    // make a new user
    var newUser = new User(
      userData.username,
      userData.password,
      userData.email,
      userData.nxt_api_key
    );

    // register user
    var registered = userController.registerUser(newUser);
    if (registered == null) res.end("User not registered!");
    else res.end("User registered!");
  });
}

function deleteUser(req, res) {
  parseUser(req, res).then((userData) => {
    var user = new User(
      userData.username,
      userData.password,
      userData.email,
      userData.nxt_api_key
    );

    var deleted = userController.removeUser(user);
    if (deleted == null) res.end("User not deleted!");
    else res.end("User deleted!");
  });
}
// parse user data from request asynchonously
function parseUser(req, res) {
  var body = "";
  req.on("data", function (chunk) {
    body += chunk;
  });
  return new Promise((resolve, reject) => {
    req.on("end", function () {
      var user = JSON.parse(body);
      resolve(user);
    });
  });
}

var server = express();

server.get("/", (req, res) => {
  printMainPage(req, res);
});

server.get("/user/register", (req, res) => {
  registerUser(req, res);
});

server.get("/user/delete", (req, res) => {
  deleteUser(req, res);
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});