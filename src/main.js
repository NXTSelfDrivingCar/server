var userController = require("./user/userController");
var User = require("./user/userModel");
var port = 5000;
var express = require("express");
var session = require("express-session");
var filestore = require("session-file-store")(session);
var path = require("path");

const nonAuthRoutes = ["/favicon.ico", "/user/register", "/user/admin/auth"];

/* 
	Routes:
	/ - test page
	/user/register - registruj korisnika
	/user/delete - obrisi korisnika
  /logout - logout i izbrisi cookie
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

function auth(req, res) {
  // var authHeader = req.headers.authorization;
  // var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
  //   .toString()
  //   .split(":");
  // // Reading username and password
  // var username = auth[0];
  // var password = auth[1];
  // if (username == "admin" && password == "password") {
  //   req.session.user = "admin";
  //   return true;
  // } else {
  //   return checkAuth(req, res);
  // }

  console.log("auth");
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function checkAuth(req, res, next) {
  console.log(req.url);

  if (isInArray(req.url, nonAuthRoutes)) {
    console.log("Non auth route");
    next(); // pozvati next kako bi se pokrenula sledeca funkcija u ruti
    return; // i zavrsiti funkciju ovde, umesto da poziva ostatak
  }

  // if the user is not authenticated
  if (!req.session.user) {
    res.redirect("/user/admin/auth"); // neka bude za sada admin auth, a posle moze da bude user login

    if (isInArray(req.url, nonAuthRoutes)) {
      console.log("Non auth route");
    }

    req.session.user = "guest";
  } else {
    if (req.session.user == "admin") {
      // ako je admin
      // promeniti da li je korisnik tipa admin iz baze, a ne samo hardcode
      return true;
    } else {
      return checkAuth(req, res);
    }
  }
}

var server = express();

server.use(
  session({
    name: "session-id",
    secret: "nxtEnter",
    saveUninitialized: false,
    resave: false,
    store: new filestore(),
  })
);

server.get("/", (req, res) => {
  printMainPage(req, res);
});

server.get("/logout", (req, res) => {
  res.status(200).clearCookie("session-id");
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

//Sve ispod ovoga zahteva auth
server.use(checkAuth);

server.get("/user/register", (req, res) => {
  //registerUser(req, res);
  console.log("Tried to register user");
});

server.get("/user/admin/auth", (req, res) => {
  console.log("Admin auth");

  auth(req, res);
});

server.get("/admin/dashboard", (req, res) => {
  console.log("Admin dashboard");
});

server.get("/user/delete", (req, res) => {
  deleteUser(req, res);
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

server.use(express.static(path.join(__dirname, "public")));

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});
