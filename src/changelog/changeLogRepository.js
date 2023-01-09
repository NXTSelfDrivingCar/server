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
      if (err) throw err;

      var db = client.db(DATABASE);

      let result = db.collection(collectionName).insertOne(changelog);

      resolve(result);
    });
  });
}

module.exports = {
  insertChangeLog,
};
