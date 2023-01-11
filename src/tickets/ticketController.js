const ticketRepository = require("./ticketRepository");
const Ticket = require("./ticketModel");
const TICKET_COLLECTION = "userTickets";

var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

async function createTicket(ticket) {
  return await ticketRepository.insertTicket(ticket, TICKET_COLLECTION);
}

async function getTicketById(id) {
  return await ticketRepository.getTicketById(id, TICKET_COLLECTION);
}

async function getAllTickets() {
  return await ticketRepository.getAllTickets(TICKET_COLLECTION);
}

async function updateTicket(id, updatedTicket) {
  return await ticketRepository.updateTicket(
    id,
    updatedTicket,
    TICKET_COLLECTION
  );
}

async function deleteTicket(id) {
  return await ticketRepository.deleteTicket(id, TICKET_COLLECTION);
}

async function getTicketsByFilter(filter) {
  return await ticketRepository.getTicketsByFilter(filter, TICKET_COLLECTION);
}

async function addCommentToTicket(id, comment) {
  return await ticketRepository.addComment(id, comment, TICKET_COLLECTION);
}

module.exports = {
  createTicket,
  getTicketById,
  getAllTickets,
  updateTicket,
  deleteTicket,
  getTicketsByFilter,
  addCommentToTicket,
};
