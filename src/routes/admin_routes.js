var userController = require("../user/userController");
var { LogHandler } = require("../logging/logHandler.js");

var logger = new LogHandler().open();
var { jsonToString, objectArrayToString } = require("../shared/util");

var jwt = require("jsonwebtoken");

async function checkAuth(req, res, next) {
  if (!req.cookies["auth"]) {
    return res.redirect("/user/login");
  }

  const token = req.cookies["auth"];
  console.log("checkAuth -> " + token);
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

    console.log(decoded);
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

  server.get("/admin/delete", (req, res) => {
    // Brisanje korisnika
    deleteUser(req, res);
  });

  server.get("/admin/edit", (req, res) => {}); // Editovanje korisnika

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
};
