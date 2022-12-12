var http = require("http");
var userController = require("./user/userController");
var User = require("./user/userModel");
var mongoClient = require("mongodb").MongoClient;
var port = 5000;

/* 
	Routes:
	/ - test page
	/user/register - register a user
	/user/delete - delete a user
*/

function printMainPage() {
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

var server = http.createServer(function (req, res) {
  switch (req.url) {
    case "/":
      printMainPage(req, res);
      break;
    case "/user/register":
      registerUser(req, res);
      break;
    case "/user/delete":
      deleteUser(req, res);
      break;
    default:
      res.end("Invalid request!");
  }
});

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});
