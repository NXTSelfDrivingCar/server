const path = require("path");
const ticketController = require("../tickets/ticketController");
const userController = require("../user/userController");
const { Ticket } = require("../tickets/ticketModel");

var { Comment } = require("../tickets/ticketModel");

async function createTicket(req, res, user) {
  var title = req.body.inputTitle;
  var category = req.body.inputCategory;
  var description = req.body.inputDescription;

  var ticketObj = new Ticket(user, title, category, description);

  await ticketController.createTicket(ticketObj);

  return ticketObj;
}

module.exports = function (server, getUserWithToken) {
  server.get("/user/debug", function (req, res) {
    // open html file
    res.sendFile(path.join(__dirname, "../views/client_page.html"));
  });

  server.get("/tickets", async function (req, res) {
    var allTickets = await ticketController.getAllTickets();

    var user = await getUserWithToken(req, res);
    res.render("tickets.ejs", {
      tickets: allTickets,
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

    console.log(ticket);
    console.log(user);

    res.render("ticket_view.ejs", {
      ticket: ticket,
      user: user,
    });
  });

  server.get("/tickets/t/close", async function (req, res) {
    var ticketID = req.query.id;
    console.log(ticketID);
    var ticket = await ticketController.getTicketById(ticketID);

    if (ticket == null) {
      res.redirect("/tickets");
    }

    ticket.status = "finished";
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
    }

    if (ticket == null) {
      res.redirect("/tickets");
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
    console.log(ticket);
    res.redirect("/tickets/t?id=" + ticket.id);
  });
};
