var { LogHandler } = require("../logging/logHandler");
var mongoClient = require("mongodb").MongoClient;
var logger = new LogHandler().open();
var ChangeLog = require("./changeLogModel");

const mongoConfig = require("../config/mongoConfig");

const CONNECTION = mongoConfig.CONNECTION;
const DATABASE = mongoConfig.DATABASE;

async function insertChangeLog(changelog, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).insertOne(changelog);

      resolve(result);
    });
  });
}

async function getLogByVersion(verson, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).find({ version: verson });

      resolve(result);
    });
  });
}
/**
 *
 * @param {int|1} limit limits the number of output elements. Default 1
 * @param {string} collectionName name of the collection to get the logs from
 * @returns {Document[]} returns the array of latest logs
 */
async function getLatestChangeLogs(limit = 1, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logger.error(err);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db
        .collection(collectionName)
        .find()
        .sort({ date: -1 })
        .limit(limit)
        .toArray();

      resolve(result);
    });
  });
}

module.exports = {
  insertChangeLog,
  getLogByVersion,
  getLatestChangeLogs,
};
