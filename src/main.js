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

async function loginUser(req, res) {
  console.log(req.body);

  var username = req.body.username;
  var password = req.body.password;

  console.log(username);
  console.log(password);

  var foundUser = await userController.loginUser(username, password);
  if (foundUser == null) res.end("User not found!");
  else {
    // ovde je bolje da se koristi userID umesto username
    req.session.user = { user_session_id: foundUser.id };
    res.end("User logged in!");
  }
}

// register i delete vrlo mogu da se spoje kasnije
// Ovo je ostavljeno sada ovako da bi se lakse razumelo

// Dodati auto role user
async function registerUser(req, res) {
  console.log(req.body);

  // make a new user
  var newUser = new User(
    req.body.username,
    req.body.password,
    req.body.email,
    "apikey",
    "user"
  );

  // register user
  var registered = await userController.registerUser(newUser);
  if (registered == null) res.end("User not registered!");
  else res.end("User registered!");
}

async function deleteUser(req, res) {
  var deleted = userController.removeUser(req.body.username);
  if (deleted == null) res.end("User not deleted!");
  else res.end("User deleted!");
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

async function checkAuth(req, res, next) {
  // console.log(req.url);

  if (isInArray(req.url, nonAuthRoutes)) {
    console.log("Non auth route");
    next(); // pozvati next kako bi se pokrenula sledeca funkcija u ruti
    return; // i zavrsiti funkciju ovde, umesto da poziva ostatak
  }

  // if the user is not authenticated
  if (!req.session.user) {
    req.session.user = "guest";
    res.redirect("/user/admin/auth"); // neka bude za sada admin auth, a posle moze da bude user login
  } else {
    var isAdmin = await userController.checkAdmin(
      req.session.user.user_session_id
    );
    if (isAdmin) {
      console.log("User is admin");
      next();
      return true;
    } else {
      console.log("User not admin");
      res.redirect("/user/admin/auth");
      return false;
    }
  }

  //next();
}

async function getUsers(req, res) {
  return await userController.findUsersByRole("user");
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

server.use(express.urlencoded({ extended: true }));
// q: how to save route after login?
// a: https://stackoverflow.com/questions/13758207/redirecting-to-a-page-after-login-in-node-js

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
//server.use(checkAuth);

server.get("/user/register", (req, res) => {
  console.log("Register user");
  res.sendFile(path.join(__dirname, "resources", "register_page.html"));
});

server.get("/user/admin/auth", checkAuth, (req, res) => {
  console.log("Admin auth");
  res.sendFile(path.join(__dirname, "resources", "login_page.html"));
});

server.get("/admin/dashboard", checkAuth, async (req, res) => {
  console.log("Admin dashboard");
  users = await getUsers(req, res);
  console.log(users);
  res.render("admin_dashboard.ejs", {
    title: "Admin dashboard",
    users: users,
  });
});

server.get("/user/delete", (req, res) => {
  deleteUser(req, res);
});

server.get("/user/edit", (req, res) => {
  console.log("Edit user");
  console.log(req.query);
});

server.get("*", (req, res) => {
  res.end("Invalid request!");
});

//Funkcija gde server dobija podatke od klijenta
server.post("/user/admin/auth", (req, res, next) => {
  loginUser(req, res);
});

server.post("/user/register", (req, res, next) => {
  registerUser(req, res);
});

server.use(express.static(path.join(__dirname, "public")));

server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});
