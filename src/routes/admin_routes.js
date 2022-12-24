var userController = require("../user/userController");
var { LogHandler } = require("../logging/logHandler.js");
var User = require("../user/userModel");

var logger = new LogHandler().open();
var {
  jsonToString,
  objectArrayToString,
  getUserWithToken,
  objectArrayToJSON,
} = require("../shared/util");

var jwt = require("jsonwebtoken");

async function checkAuth(req, res, next) {
  logData = {
    action: "checkAuth",
    method: req.method,
    url: req.url,
    body: req.body,
    cookies: req.cookies,
  };

  if (!req.cookies["auth"]) {
    logger.log("info", logData);
    return res.redirect("/user/login");
  }

  const token = req.cookies["auth"];
  if (!token) {
    logger.log("info", logData);
    return res.redirect("/user/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.username = decoded.user.username;

    logData["user"] = {
      id: decoded.user.id,
      username: decoded.user.username,
      role: decoded.user.role,
    };

    // decoded.user.username != decoded.username

    // Dodati obavestenje ako nisi admin, zasto nisi admin i azsto ne pripadas ovde mamu ti jebm
    // aka zasto si rerouteovan na login
    if (decoded.user.role != "admin") {
      logData["result"] = "User is not admin";
      logger.log("info", logData);
      return res.redirect("/user/login");
    } // thanks to this, only admin can access admin routes

    logData["result"] = "User is admin";
    logger.log("info", logData);

    next();
    return;
  } catch (err) {
    logData["error"] = err;
    logger.logError(logData);
    return res.redirect("/user/login");
  }
}

async function filterSeachUsers(req, res) {
  var filters = {};
  if (req.body != null) var filters = req.body; // Ako ne postoji body, samo prikazati sve korisnikes

  var formatFilters = {};

  // foreach key in filters
  for (var key in filters) {
    if (filters[key] != "") {
      formatFilters[key] = filters[key];
    }
  }

  var foundUsers = await userController.filterSearch(formatFilters);

  return foundUsers;
}

async function deleteUser(req, res) {
  return await userController.removeUser(req.query["id"]);
}

async function updateUser(req, res) {
  var id = req.body.inputID;
  var username = req.body.inputUsername;
  var email = req.body.inputEmail;
  var role = req.body.inputRole;

  var userContainer = new User(username, null, email, null, role);

  var updated = await userController.updateUser(
    req.body.inputID,
    userContainer
  );

  if (updated) console.log("Updated");
  else console.log("Not updated");
  return updated;
}

/*
 *
 *==========================================================================
 *==========================================================================
 *=========================== MODULE EXPORTS ===============================
 *==========================================================================
 *==========================================================================
 *
 */

module.exports = function (server) {
  // =================== GET ROUTES =================== //

  server.get("/admin/debug", (req, res) => {
    console.log(req.cookies);
  }); // Debug

  server.get("/admin/dashboard", checkAuth, async (req, res) => {
    logger.log("info", {
      action: "openAdminDashboard",
      method: req.method,
      url: req.url,
      cookies: req.cookies,
    });

    res.render("admin_dashboard_index.ejs", {
      title: "Admin dashboard",
    });
  });

  server.get("/admin/admin_list_users", checkAuth, async (req, res) => {
    var users = await filterSeachUsers(req, res); // Ovo je array of users

    logger.log("info", {
      action: "openAdminListUsers",
      method: req.method,
      url: req.url,
      cookies: req.cookies,
    });

    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.get("/admin/user/delete", checkAuth, async (req, res) => {
    var deleted = await deleteUser(req, res);

    logger.log("info", {
      action: "deleteUser",
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies,
      deleted: deleted,
    });

    res.redirect("/admin/admin_list_users");
  });

  server.get("/admin/user/update", checkAuth, async (req, res) => {
    if (req.query["id"] == null) return res.end("No user id provided!");
    var gotUser = await userController.findUserById(req.query["id"]);

    if (gotUser == null) {
      return res.end("User id is not valid");
    }

    logger.log("info", {
      action: "openAdminUserUpdate",
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies,
      user: {
        id: gotUser.id,
        username: gotUser.username,
        email: gotUser.email,
      },
    });

    res.render("admin_user_update.ejs", {
      title: "Update user",
      user: gotUser,
    });
  }); // Editovanje korisnika

  //* =================== POST ROUTES =================== *//

  // TODO: Proveriti da li tehnicki mora da stoji checkAuth u post rutama

  server.post("/admin/admin_list_users", async (req, res) => {
    var users = await filterSeachUsers(req, res); // Ovo je array of users

    logger.log("info", {
      action: "listUsers",
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies,
      listUsers: objectArrayToJSON(users, "username", "id"),
    });

    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.post("/admin/user/admin_user_update", async (req, res) => {
    var updatedUser = await updateUser(req, res);

    logger.log("info", {
      action: "updateUser",
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies,
      updated: {
        id: req.body.inputID,
        username: req.body.inputUsername,
        email: req.body.inputEmail,
        role: req.body.inputRole,
      },
    });

    if (updatedUser == false) {
      logger.log("info", {
        action: "updateUser",
        method: req.method,
        url: req.url,
        body: req.body,
        cookies: req.cookies,
        status: 400,
        message: "User update failed, check your input data!",
      });
      return res.status(400).send("User update failed, check your input data!");
    }
    res.redirect("/admin/admin_list_users");
  });
};
