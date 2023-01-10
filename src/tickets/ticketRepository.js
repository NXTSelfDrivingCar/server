var mongoClient = require("mongodb").MongoClient;
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var Ticket = require("./ticketModel");

const mongoConfig = require("../config/mongoConfig");
const { FindCursor } = require("mongodb");

const CONNECTION = mongoConfig.CONNECTION;
const DATABASE = mongoConfig.DATABASE;

/**
 *
 * @param {Ticket} ticket - Ticket to be inserted
 * @param {string} collectioName - Name of the collection to be queried
 * @returns {Promise<Document>}
 */
async function insertTicket(ticket, collectioName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectioName).insertOne(ticket);

      resolve(result);
    });
  });
}

/**
 *
 * @param {uuid} id - Id to search by
 * @param {string} collectioName - Name of the collection to be queried
 * @returns {Promise<FindCursor>} - Returns a cursor to the found ticket
 */
async function getTicketById(id, collectioName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectioName).find({ id: id });

      resolve(result);
    });
  });
}

/**
 * Returns all tickets from database
 * @param {string} collectionName - Name of the collection to be queried
 * @returns {Promise<Array<FindCursor>>}
 */
async function getAllTickets(collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).find();

      resolve(result);
    });
  });
}

/**
 *
 * @param {uuid} id - Id to search by
 * @param {Ticket} ticket - Updated ticket values
 * @param {string} collectionName - Name of the collection to be queried
 * @returns {Promise<Document>} - Promise with the result of the query
 */
async function updateTicket(id, ticket, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db
        .collection(collectionName)
        .updateOne({ id: id }, { $set: ticket });

      resolve(result);
    });
  });
}

/**
 * Deletes a ticket from the database by id
 * @param {uuid} id - Id to search by
 * @param {string} collectionName - Name of the collection to be queried
 * @returns {Promise<Document>} - Promise with the result of the query
 */
async function deleteTicket(id, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).deleteOne({ id: id });

      resolve(result);
    });
  });
}

/**
 *
 * @param {Dict} filter - Filter to be applied to the query
 * @param {string} collectionName - Name of the collection to be queried
 * @returns {Promise<FindCursor>} - Promise with the result of the query
 */
async function getTicketsByFilter(filter, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).find(filter);

      resolve(result);
    });
  });
}

module.exports = {
  insertTicket,
  getTicketById,
  getAllTickets,
  updateTicket,
  deleteTicket,
  getTicketsByFilter,
};
