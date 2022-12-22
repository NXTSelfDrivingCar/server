var dotenv = require("dotenv").config({ path: ".env" });
var { LogHandler } = require("./logging/logHandler.js");
var express = require("express");
var path = require("path");
var port = 5000;
var User = require("./user/userModel");
var cookies = require("cookie-parser");
var jwt = require("jsonwebtoken");

var logger = new LogHandler().open();

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns User from token (guest if no token is found)
 */
function getUserWithToken(req, res) {
  if (req.cookies.auth) {
    var decoded = jwt.verify(
      req.cookies.auth,
      process.env.JWT_SECRET,

      // Dodata funkcija u slucaju da je token istekao
      // Ako je token istekao, vraca null i to dozvoljava da se vrati guest korisnik
      function (err, decoded) {
        if (err) {
          logger.log("ERROR", "getUserWithToken", "jwt.verify", err);
          return null;
        }
        return decoded;
      }
    );

    if (decoded == null) {
      return new User("guest", "guest", "guest", "guest", "guest");
    }
    // make a new user from decoded token
    var newUser = new User(
      decoded.user.username,
      decoded.user.password,
      decoded.user.email,
      decoded.user.nxt_api_key,
      decoded.user.role
    );

    return newUser;
  } else {
    // return guest user
    return new User("guest", "guest", "guest", "guest", "guest");
  }
}

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
