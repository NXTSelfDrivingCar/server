var userController = require("../user/userController");
var { LogHandler } = require("../logging/logHandler.js");
var User = require("../user/userModel");

var logger = new LogHandler().open();
var {
  jsonToString,
  objectArrayToString,
  getUserWithToken,
} = require("../shared/util");

var jwt = require("jsonwebtoken");

async function checkAuth(req, res, next) {
  if (!req.cookies["auth"]) {
    return res.redirect("/user/login");
  }

  const token = req.cookies["auth"];
  if (!token) {
    return res.redirect("/user/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.username = decoded.user.username;

    // decoded.user.username != decoded.username

    // Dodati obavestenje ako nisi admin, zasto nisi admin i azsto ne pripadas ovde mamu ti jebm
    // aka zasto si rerouteovan na login
    if (decoded.user.role != "admin") return res.redirect("/user/login"); // thanks to this, only admin can access admin routes

    console.log("Administrator user: ");
    console.log(decoded.user);

    next();
    return;
  } catch (err) {
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
  logger.log(
    "INFO",
    "/admin/admin_list_users",
    "filterSeachUsers",
    jsonToString(formatFilters)
  );

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
    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result auth user: " +
        getUserWithToken(req, res).id +
        " | " +
        getUserWithToken(req, res).username
    );

    res.render("admin_dashboard_index.ejs", {
      title: "Admin dashboard",
    });
  });

  server.get("/admin/admin_list_users", checkAuth, async (req, res) => {
    var users = await filterSeachUsers(req, res); // Ovo je array of users
    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result auth user: " +
        getUserWithToken(req, res).id +
        " | " +
        getUserWithToken(req, res).username
    );
    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.get("/admin/user/delete", async (req, res) => {
    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result auth user: " +
        getUserWithToken(req, res).id +
        " | " +
        getUserWithToken(req, res).username +
        " | " +
        "User requested: " +
        req.query["id"]
    );
    var deleted = await deleteUser(req, res);
    res.redirect("/admin/admin_list_users");
  });

  server.get("/admin/user/update", async (req, res) => {
    if (req.query["id"] == null) return res.end("No user id provided!");
    var gotUser = await userController.findUserById(req.query["id"]);

    if (gotUser == null) {
      logger.log(
        "ERROR",
        req.url,
        req.method,
        "Log result auth user: " +
          getUserWithToken(req, res).id +
          " | " +
          getUserWithToken(req, res).username +
          " | User requested: " +
          req.query["id"] +
          " | " +
          "User not found"
      );

      return res.end("User id is not valid");
    }

    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result auth user: " +
        getUserWithToken(req, res).id +
        " | " +
        getUserWithToken(req, res).username +
        " | " +
        "User requested: " +
        gotUser.id +
        " | " +
        gotUser.username +
        " | " +
        gotUser.email +
        " | " +
        gotUser.role
    );

    res.render("admin_user_update.ejs", {
      title: "Update user",
      user: gotUser,
    });
  }); // Editovanje korisnika

  //* =================== POST ROUTES =================== *//

  server.post("/admin/admin_list_users", async (req, res) => {
    logger.log("INFO", req.url, req.method, "LISTING USERS START");

    var users = await filterSeachUsers(req, res); // Ovo je array of users

    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result: " + objectArrayToString(users, "id")
    );

    logger.log("INFO", req.url, req.method, "LISTING USERS END");
    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.post("/admin/user/admin_user_update", async (req, res) => {
    logger.log("INFO", req.url, req.method, "UPDATE USER START");

    var updatedUser = await updateUser(req, res);

    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result auth user: " +
        getUserWithToken(req, res).id +
        " | " +
        getUserWithToken(req, res).username +
        " | " +
        "Update result: " +
        updatedUser +
        " | " +
        req.body.inputID +
        " | " +
        req.body.inputUsername +
        " | " +
        req.body.inputEmail +
        " | " +
        req.body.inputRole +
        " | "
    );

    logger.log("INFO", req.url, req.method, "UPDATE USER END");
    if (updatedUser == false)
      return res.status(400).send("User update failed, check your input data!");
    res.redirect("/admin/admin_list_users");
  });
};
