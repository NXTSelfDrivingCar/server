var userController = require("../user/userController");
var User = require("../user/userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var jwt = require("jsonwebtoken");

const { checkJsonFormat } = require("../public/util");
const dotenv = require("dotenv").config({ path: ".env" });

const registerFormat = {
  username: "string",
  password: "string",
  password2: "string",
  email: "string",
};

const loginFormat = {
  username: "string",
  password: "string",
};

async function checkPasswords(req, res) {
  if (req.body.password == req.body.password2) {
    return true;
  } else {
    return false;
  }
}

async function loginUser(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  // gets user from database if found
  var foundUser = await userController.loginUser(username, password);
  if (foundUser == null) return false;
  else {
    // if user is found, create a token and send it to the client
    // Token is created with the user object as payload and the secret key from .env
    console.log("Found user: " + foundUser.username);

    const token = jwt.sign({ user: foundUser }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Token: ");
    console.log(token);

    // send token to client
    res.cookie("auth", token, { httpOnly: true, secure: false });

    return true;
  }
}

async function registerUser(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var apiKey = "apikey";
  var role = "user";

  // make a new user
  var newUser = new User(username, password, email, apiKey, role);

  // register user
  var registered = await userController.registerUser(newUser);
  if (registered == null) {
    return false;
  } else {
    return true;
  }
}

/*

*==========================================================================
*==========================================================================
*============================= MODULE EXPORTS =============================
*==========================================================================
*==========================================================================

 */

module.exports = function (server, getUserWithToken) {
  // =================== GET ROUTES =================== //

  server.get("/user/logout", async (req, res) => {
    //
    res.status(200).clearCookie("auth");
    res.redirect("/");
  });

  server.get("/user/register", async (req, res) => {
    result = "";
    passResult = "";

    logger.log("info", {
      action: "getRegisterPage",
      url: req.url,
      method: "GET",
      serverOrigin: "HttpServer",
      sessionId: req.session,
    });

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

    logger.log("info", {
      action: "getLoginPage",
      url: req.url,
      method: "GET",
      serverOrigin: "HttpServer",
      sessionId: req.session,
    });

    res.render("login_page.ejs", {
      title: "Login page",
      user: await getUserWithToken(req, res), // Gets user for navbar
      session: req.session,
      result: result,
    });
  });

  //* =================== POST ROUTES =================== *//

  server.post("/user/login", async (req, res, next) => {
    if (checkJsonFormat(req.body, loginFormat) == false) {
      return res.status(400).send("Bad request (400) - Invalid JSON format");
    }

    var result = await loginUser(req, res, next);

    logger.log("info", {
      action: "loginUser",
      url: req.url,
      method: "POST",
      serverOrigin: "HttpServer",
      sessionId: req.session,
      result: result,
      user: {
        username: req.body.username,
      },
    });

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
    if (checkJsonFormat(req.body, registerFormat) == false) {
      return res.status(400).send("Bad request (400) - Invalid JSON format");
    }

    var passResult = await checkPasswords(req, res);

    logger.log("info", {
      action: "registerUser",
      url: req.url,
      method: "POST",
      serverOrigin: "HttpServer",
      sessionId: req.session,
      result: result,
      user: {
        username: req.body.username,
        email: req.body.email,
      },
    });

    // If passwords don't match, render page again with error message
    if (!passResult) {
      res.render("register_page.ejs", {
        title: "Register page",
        user: await getUserWithToken(req, res), // Gets user for navbar
        session: req.session,
        result: result,
        passResult: passResult,
      });
      return;
    }

    var result = await registerUser(req, res);

    // If user is registered, redirect to login page
    if (result) {
      res.redirect("/user/login");
      return;
    } else {
      res.render("register_page.ejs", {
        title: "Register page",
        user: await getUserWithToken(req, res), // Gets user for navbar
        session: req.session,
        result: result,
        passResult: passResult,
      });
      return;
    }
  });

  /*
   *==========================================================================
   *==========================================================================
   *============================= MOBILE ROUTES ==============================
   *==========================================================================
   *==========================================================================
   */

  server.post("/user/login/mobile", async (req, res, next) => {
    if (checkJsonFormat(req.body, loginFormat) == false)
      return res.send({ status: "invalidFormat" });

    var result = await loginUser(req, res, next);

    logger.log("info", {
      action: "loginUser",
      url: req.url,
      method: "POST",
      serverOrigin: "HttpServer",
      deviceOrigin: "Mobile",
      sessionId: req.session,
      result: result,
      user: {
        username: req.body.username,
      },
    });

    var user = await getUserWithToken(req, res);

    if (result) {
      return res.send({ status: "OK", id: user.id, username: user.username });
    } else {
      return res.send({ status: "Unauthorized" });
    }
  });

  server.post("/user/register/mobile", async (req, res, next) => {
    if (checkJsonFormat(req.body, registerFormat) == false) {
      return res.send({ status: "invalidFormat" });
    }

    var passResult = await checkPasswords(req, res);

    logger.log("info", {
      action: "registerUser",
      url: req.url,
      method: "POST",
      serverOrigin: "HttpServer",
      deviceOrigin: "Mobile",
      sessionId: req.session,
      result: result,
      user: {
        username: req.body.username,
        email: req.body.email,
      },
    });

    if (!passResult) {
      return res.send({ status: "passwordMismatch" });
    }

    var result = await registerUser(req, res);

    if (result) {
      return res.send({ status: "OK" });
    }

    if (!result) {
      return res.send({ status: "userExists" });
    }

    return res.send({ status: "error" });
  });

  server.post("/user/update/mobile", async (req, res, next) => {
    // var token = req.body.token;
    // Ako ne postoji vrati
    console.log("Update mobile: ");
    console.log(req.body);

    var token = req.body.tkn;

    if (token == undefined) {
      return res.send({ status: "invalidToken" });
    }

    var verified = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Verified token:");
    console.log(verified);

    var decoded = jwt.decode(token, { complete: true });

    console.log("Decoded token:");
    console.log(decoded);

    if (decoded.user.id != req.body.userId) {
      return res.send({ status: "invalidToken" });
    }

    // TODO: Update user
  });
};
