var userController = require("../user/userController");
var User = require("../user/userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var jwt = require("jsonwebtoken");
require("dotenv").config();

async function checkPasswords(req, res) {
  logger.log(
    "INFO",
    req.url,
    req.method,
    "Password 1: " + req.body.password + " - Password 2: " + req.body.password2
  );

  if (req.body.password == req.body.password2) {
    return true;
  } else {
    return false;
  }
}

async function loginUser(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  logger.log(
    "INFO",
    req.url,
    req.method,
    "Username: " + username + " - Password: " + password
  );

  // gets user from database if found
  var foundUser = await userController.loginUser(username, password);
  if (foundUser == null) return false;
  else {
    // if user is found, create a token and send it to the client
    // Token is created with the user object as payload and the secret key from .env
    const token = jwt.sign({ user: foundUser }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // send token to client
    res.cookie("auth", token, { httpOnly: false });

    return true;
  }
}

async function registerUser(req, res) {
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
  if (registered == null) return false;
  else {
    return true;
  }
}

/*

==========================================================================
==========================================================================
============================= MODULE EXPORTS =============================
==========================================================================
==========================================================================

 */

module.exports = function (server, getUserWithToken) {
  // =================== GET ROUTES =================== //

  server.get("/user/logout", async (req, res) => {
    // logger.log("INFO", "/user/logout", "GET", user.username);

    // TODO: [log] user out token and session
    res.status(200).clearCookie("auth");
    res.redirect("/");
  });

  server.get("/user/register", async (req, res) => {
    result = "";
    passResult = "";
    res.render("register_page.ejs", {
      title: "Regsiter page",
      result: result,
      user: await getUserWithToken(req, res), // Gets user for navbar
      session: req.session,
      passResult: passResult,
    });
  });

  server.get("/user/login", async (req, res) => {
    result = "";
    res.render("login_page.ejs", {
      title: "Login page",
      user: await getUserWithToken(req, res), // Gets user for navbar
      session: req.session,
      result: result,
    });
  });

  // =================== POST ROUTES =================== //

  server.post("/user/login", async (req, res, next) => {
    var result = await loginUser(req, res, next);
    logger.log("INFO", "/user/login", "POST", "Log result: " + result);

    if (result) {
      res.redirect("/");
    } else {
      res.render("login_page.ejs", {
        title: "Login page",
        user: await getUserWithToken(req, res), // Gets user for navbar
        session: req.session,
        result: result,
      });
    }
  });

  server.post("/user/register", async (req, res, next) => {
    var result = await registerUser(req, res);
    var passResult = await checkPasswords(req, res);
    logger.log("INFO", "/user/register", "POST", "Log result: " + result);

    if (result) {
      res.redirect("/");
    } else {
      var result = null;
      if (passResult) {
        // TODO: Proveriti zasto se ovo poziva drugi put ovde
        result = await registerUser(req, res); // ZASTO DVA PUTA POZIVAMO REGISTER USER?
      }

      res.render("register_page.ejs", {
        title: "Register page",
        user: await getUserWithToken(req, res), // Gets user for navbar
        session: req.session,
        result: result,
        passResult: passResult,
      });
    }
  });
};
