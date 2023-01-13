var userController = require("../user/userController");
var User = require("../user/userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var jwt = require("jsonwebtoken");

const {
  checkJsonFormat,
  getUserWithToken,
  jsonFromKeys,
} = require("../public/util");
const dotenv = require("dotenv").config({ path: ".env" });

const registerFormat = {
  username: "string",
  password: "string",
  email: "string",
};

const loginFormat = {
  username: "string",
  password: "string",
};

async function loginUser(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

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
    res.cookie("auth", token, { httpOnly: true, secure: false });

    return true;
  }
}

async function updateUserPassword(req, res, verified) {
  var oldUser = jsonFromKeys(verified.user, true, "_id");

  oldUser.password = req.body.newPassword;

  console.log("New password is: " + oldUser.password);

  var updated = await userController.updateUser(oldUser.id, oldUser);

  if (updated == null) {
    return false;
  } else {
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

  server.get("/user/settings", async (req, res) => {
    res.render("user_edit.ejs", {
      title: "Edit user",
      user: await getUserWithToken(req, res),
    });
  });

  //* =================== POST ROUTES =================== *//

  server.post("/user/remove", async (req, res) => {
    var user = await getUserWithToken(req, res);

    if (!user) {
      return res.redirect("/user/login");
    }

    var removed = await userController.removeUser(user.id);

    res.clearCookie("auth");

    if (removed == null) {
      return res.status(500).send("Internal server error (500)");
    } else {
      return res.redirect("/");
    }
  });

  server.post("/user/edit", async (req, res) => {
    var user = await getUserWithToken(req, res);

    if (!user) {
      return res.redirect("/user/login");
    }

    // TODO: Ovo treba refaktorirati do maksimuma jer je krs
    console.log("Body:");
    console.log(req.body);

    console.log("Verified: ");
    console.log(user);

    var key = req.body.type;
    var value = req.body.value;

    var oldUser = jsonFromKeys(user, true, "_id");

    console.log("Old user: ");
    console.log(oldUser);

    oldUser[key] = value;

    var updated = await userController.updateUser(oldUser.id, oldUser, key);

    res.clearCookie("auth");

    var token = jwt.sign({ user: oldUser }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("auth", token, { httpOnly: true, secure: false });

    if (updated == null) {
      return res.status(500).send("Internal server error (500)");
    } else {
      return res.redirect("/user/settings");
    }
  });

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
    if (req.body.password != req.body.password2) {
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
    // Check if JSON format is valid
    console.log(req.body);

    if (checkJsonFormat(req.body, loginFormat) == false)
      return res.send({ status: "invalidFormat" });

    // Gets true or false if user is logged in
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

    // If user is logged in, send OK
    if (result) {
      return res.send({ status: "OK" });
    } else {
      return res.send({ status: "Unauthorized" });
    }
  });

  server.post("/user/register/mobile", async (req, res, next) => {
    // Check if JSON format is valid
    console.log(req.body);

    if (checkJsonFormat(req.body, registerFormat) == false) {
      return res.send({ status: "invalidFormat" });
    }

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

    // Gets true or false if user is logged in
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
    var token = req.body.token;

    if (token == undefined) {
      return res.send({
        status: "invalidToken",
        message: "Token is undefined",
      });
    }

    var verified = jwt.verify(token, process.env.JWT_SECRET);

    var result = updateUserPassword(req, res, verified);

    if (!result) {
      return res.send({ status: "Failed update" });
    } else {
      return res.send({ status: "OK" });
    }
  });

  server.post("/user/remove/mobile", async (req, res, next) => {
    // var token = req.body.token;
    // Ako ne postoji vrati
    console.log("Remove user mobile: ");
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

    if (decoded.payload.user.id != verified.user.id) {
      return res.send({ status: "invalidToken" });
    }

    var result = userController.removeUser(verified.user.id);
    if (!result) {
      return res.send({ status: "Failed remove" });
    } else {
      return res.send({ status: "OK" });
    }
  });
};
