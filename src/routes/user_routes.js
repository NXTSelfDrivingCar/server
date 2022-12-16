var userController = require("../user/userController");
var User = require("../user/userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var { jsonToString, objectArrayToString } = require("../shared/util");
var session = require("express-session");
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

  var foundUser = await userController.loginUser(username, password);
  if (foundUser == null) return false;
  else {
    const token = jwt.sign({ user: foundUser }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    //res.setHeader("authorization", token);
    //res.headers = { authorization: token };
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

module.exports = function (server, getUserFromSession) {
  // =================== GET ROUTES =================== //

  server.get("/user/logout", async (req, res) => {
    var user = await getUserFromSession(req, res);
    logger.log("INFO", "/user/logout", "GET", user.username);

    res.status(200).clearCookie("auth");
    res.redirect("/");
  });

  server.get("/user/register", async (req, res) => {
    result = "";
    passResult = "";
    res.render("register_page.ejs", {
      title: "Regsiter page",
      result: result,
      user: await getUserFromSession(req, res),
      session: req.session,
      passResult: passResult,
    });
  });

  server.get("/user/login", async (req, res) => {
    result = "";
    res.render("login_page.ejs", {
      title: "Login page",
      user: await getUserFromSession(req, res),
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
        user: await getUserFromSession(req, res),
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
        result = await registerUser(req, res);
      }

      res.render("register_page.ejs", {
        title: "Register page",
        user: await getUserFromSession(req, res),
        session: req.session,
        result: result,
        passResult: passResult,
      });
    }
  });
};
