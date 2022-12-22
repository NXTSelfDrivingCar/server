var userController = require("../user/userController");
var { LogHandler } = require("../logging/logHandler.js");
var User = require("../user/userModel");

var logger = new LogHandler().open();
var { jsonToString, objectArrayToString } = require("../shared/util");

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
  var deleted = userController.removeUser(req.body.username);
  if (deleted == null) res.end("User not deleted!");
  else res.end("User deleted!");
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

==========================================================================
==========================================================================
=========================== MODULE EXPORTS ===============================
==========================================================================
==========================================================================

 */

module.exports = function (server) {
  // =================== GET ROUTES =================== //

  server.get("/admin/debug", (req, res) => {
    console.log(req.cookies);
  }); // Debug

  server.get("/admin/dashboard", checkAuth, async (req, res) => {
    res.render("admin_dashboard_index.ejs", {
      title: "Admin dashboard",
    });
  });

  server.get("/admin/admin_list_users", checkAuth, async (req, res) => {
    var users = await filterSeachUsers(req, res); // Ovo je array of users
    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.get("/admin/user/delete", (req, res) => {
    // Brisanje korisnika
    deleteUser(req, res);
  });

  server.get("/admin/user/update", async (req, res) => {
    if (req.query["id"] == null) return res.end("No user id provided!");
    var gotUser = await userController.findUserById(req.query["id"]);

    if (gotUser == null) return res.end("User id is not valid");
    res.render("admin_user_update.ejs", {
      title: "Update user",
      user: gotUser,
    });
  }); // Editovanje korisnika

  // =================== POST ROUTES =================== //

  server.post("/admin/admin_list_users", async (req, res) => {
    var users = await filterSeachUsers(req, res); // Ovo je array of users
    logger.log(
      "INFO",
      req.url,
      req.method,
      "Log result: " + objectArrayToString(users, "id") // Ovo ne vraca nista
    );

    res.render("admin_list_users.ejs", {
      title: "Listing users",
      users: users,
    });
  });

  server.post("/admin/user/admin_user_update", async (req, res) => {
    var updatedUser = await updateUser(req, res);
    if (updatedUser == false)
      return res.status(400).send("User update failed, check your input data!");
    res.redirect("/admin/admin_list_users");
  });
};
