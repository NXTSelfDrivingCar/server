const path = require("path");
const ticketController = require("../tickets/ticketController");
const userController = require("../user/userController");
const { Ticket } = require("../tickets/ticketModel");
const { isEmpty } = require("../public/util");

var { Comment } = require("../tickets/ticketModel");

async function createTicket(req, res, user) {
  var title = req.body.inputTitle;
  var category = req.body.inputCategory;
  var description = req.body.inputDescription;

  var ticketObj = new Ticket(user, title, category, description);

  await ticketController.createTicket(ticketObj);

  return ticketObj;
}

async function filterSearchTickets(req, res) {
  var filters = req.query; // Default je {}, tako da ce prikazati sve propusnice

  var formatFilters = {};

  // foreach key in filters
  for (var key in filters) {
    if (filters[key] != "") {
      formatFilters[key] = filters[key];
    }
  }

  var foundTickets = await ticketController.getTicketsByFilter(formatFilters);
  return foundTickets;
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

module.exports = function (server, getUserWithToken) {
  server.get("/user/debug", function (req, res) {
    // open html file
    res.sendFile(path.join(__dirname, "../views/client_page.html"));
  });

  server.get("/tickets", async function (req, res) {
    var filteredTickets = await filterSearchTickets(req, res);

    var user = await getUserWithToken(req, res);
    res.render("tickets.ejs", {
      tickets: filteredTickets,
      user: user,
    });
  });

  server.get("/tickets/t", async function (req, res) {
    var ticketID = req.query.id;
    var ticket = await ticketController.getTicketById(ticketID);
    var user = await getUserWithToken(req, res);

    if (ticket == null) {
      res.redirect("/tickets");
    }

    res.render("ticket_view.ejs", {
      ticket: ticket,
      user: user,
    });
  });

  server.get("/tickets/t/close", async function (req, res) {
    var ticketID = req.query.id;
    var ticket = await ticketController.getTicketById(ticketID);

    if (ticket == null) {
      res.redirect("/tickets");
    }

    ticket.status = "Finished";
    await ticketController.updateTicket(ticketID, ticket);

    res.redirect("/tickets/t?id=" + ticketID);
  });

  //* =================== POST ROUTES =================== *//

  server.post("/tickets/t/comment", async function (req, res) {
    var ticketID = req.body.ticketId;
    var userID = req.body.userId;
    var comment = req.body.inputComment;
    var ticket = await ticketController.getTicketById(ticketID);
    var user = await getUserWithToken(req, res);

    if (user.role == "guest") {
      res.redirect("/user/login");
      return;
    }

    if (ticket == null) {
      res.redirect("/tickets");
      return;
    }

    var comment = new Comment(user.username, user.role, comment);

    await ticketController.addCommentToTicket(ticketID, comment);

    res.redirect("/tickets/t?id=" + ticketID);
  });

  server.post("/tickets/t/add", async function (req, res) {
    var user = await getUserWithToken(req, res);

    if (user.role == "guest") {
      res.redirect("/user/login");
    }

    ticket = await createTicket(req, res, user);
    res.redirect("/tickets/t?id=" + ticket.id);
  });

  server.post("/admin/tickets/t/update", async function (req, res) {
    var ticketID = req.body.ticketId;
    var status = req.body.inputStatus;
    var priority = req.body.inputPriority;

    var ticket = await ticketController.getTicketById(ticketID);
    ticket.status = status;
    ticket.priority = priority;

    await ticketController.updateTicket(ticketID, ticket);

    res.redirect("/tickets/t?id=" + ticketID);
  });
};
