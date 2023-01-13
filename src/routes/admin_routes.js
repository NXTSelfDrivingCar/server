var userController = require("../user/userController");
var changeLogController = require("../changelog/changeLogController");
var logController = require("../logging/logController");
var { LogHandler } = require("../logging/logHandler.js");
var User = require("../user/userModel");
var ChangeLog = require("../changelog/changeLogModel");

var logger = new LogHandler().open();
var {
  jsonToString,
  objectArrayToString,
  getUserWithToken,
  objectArrayToJSON,
} = require("../public/util");

var jwt = require("jsonwebtoken");
const { json } = require("express");

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

  var oldUser = await userController.findUserById(id);

  oldUser.username = username;
  oldUser.email = email;
  oldUser.role = role;

  var updated = await userController.updateUser(req.body.inputID, oldUser);

  if (updated) console.log("Updated");
  else console.log("Not updated");
  return updated;
}

async function addChangelog(req, res) {
  var newChangelog = new ChangeLog(
    req.body.inputTitle,
    req.body.inputVersion,
    req.body.inputIsBeta,
    req.body.inputDescription
  );

  return await changeLogController.addChangelog(newChangelog);
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

  // Rendering
  server.get("/admin/logs", checkAuth, async (req, res) => {
    var allLogs = await logController.getAllLogs();
    res.render("admin_logs.ejs", {
      title: "Admin logs",
      logs: allLogs,
    });
  });

  server.get("/admin/logs/view/log", checkAuth, async (req, res) => {
    var logName = req.query["id"];
    var logFile = await logController.getLog(logName);
    var items = JSON.parse(logFile);

    res.render("admin_log_view.ejs", {
      title: "Admin logs",
      log: items,
      currentLog: logger.getCurrentFile(),
    });
  });

  server.get("/admin/logs/delete/log", checkAuth, async (req, res) => {
    var logName = req.query["id"];
    var deleted = await logController.deleteLog(logName);

    res.redirect("/admin/logs");
  });

  server.get("/admin/changelog/add", checkAuth, async (req, res) => {
    // TODO: Dodati da se ucita poslednji log kada se otvori stranica i da se renderuje (tipa preko datuma)
    let lastChangelog = await changeLogController.getLatestChangeLogs();
    if (lastChangelog == null) lastChangelog = [];

    if (lastChangelog.length > 0) lastChangelog = lastChangelog[0];

    res.render("admin_changelog.ejs", {
      title: "Adding changelog",
      latestChangelog: lastChangelog,
    });
  });

  //* =================== POST ROUTES =================== *//

  server.post("/admin/changelog/add", checkAuth, async (req, res) => {
    let changeLog = addChangelog(req, res);
    res.redirect("/admin/changelog/add");
  });

  // TODO: Obrisati svaki post method za ono sto bi trebalo da bude get (tipa ovo ispod)
  server.post("/admin/admin_list_users", checkAuth, async (req, res) => {
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
    let logData = {
      action: "updateUser",
      method: req.method,
      url: req.url,
      body: req.body,
      cookies: req.cookies,
    };

    if (updatedUser == false) {
      logData["status"] = 400;
      logData["message"] = "User update failed, check your input data!";

      logger.log("info", logData);
      return res.status(400).send("User update failed, check your input data!");
    }

    logData["status"] = 200;
    logData["message"] = "User updated successfully!";
    logData["user"] = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    };

    logger.log("info", logData);
    res.redirect("/admin/admin_list_users");
  });
};
