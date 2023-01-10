var { LogHandler } = require("../logging/logHandler");
var mongoClient = require("mongodb").MongoClient;
var logger = new LogHandler().open();
var ChangeLog = require("./changeLogModel");

const mongoConfig = require("../config/mongoConfig");

const CONNECTION = mongoConfig.CONNECTION;
const DATABASE = mongoConfig.DATABASE;

async function insertChangeLog(changelog, collectionName) {
  var logData = {
    origin: "ChangeLogRepository",
    method: "insertChangeLog",
    action: "insertChangeLog",
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).insertOne(changelog);

      logData["result"] = "ChangeLog inserted";
      logger.log("info", logData);
      resolve(result);
    });
  });
}

async function getLogByVersion(verson, collectionName) {
  var logData = {
    origin: "ChangeLogRepository",
    method: "getLogByVersion",
    action: "getLogByVersion",
    version: verson,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).find({ version: verson });

      logData["result"] = "ChangeLog found";
      logger.log("info", logData);
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
  var logData = {
    origin: "ChangeLogRepository",
    method: "getLatestChangeLogs",
    action: "getLatestChangeLogs",
    limit: limit,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      let result = db
        .collection(collectionName)
        .find()
        .sort({ date: -1 })
        .limit(limit)
        .toArray();

      logData["result"] = "Logs found";
      logger.log("info", logData);
      resolve(result);
    });
  });
}

module.exports = {
  insertChangeLog,
  getLogByVersion,
  getLatestChangeLogs,
};
