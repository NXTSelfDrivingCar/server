const mongoClient = require("mongodb").MongoClient;
const { LogHandler } = require("../logging/logHandler");
const mongoConfig = require("../config/mongoConfig");

const User = require("./userModel");

const CONNECTION = mongoConfig.CONNECTION;
const DATABASE = mongoConfig.DATABASE;

var logger = new LogHandler().open();

// ! INSERT USER

async function insertUser(user, collectionName) {
  var logData = {
    origin: "UserRepository",
    method: "insertUser",
    action: "insert",
    user: {
      id: user.id,
      username: user.username,
    },
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      db.collection(collectionName).insertOne(user, function (err, res) {
        if (err) {
          logData["error"] = err;

          logger.error(logData);

          reject(err);
        }

        logData["result"] = "User inserted";

        logger.log(logData);

        resolve(true);
      });
    });
  });
}

// ! REMOVE USER

async function removeUser(id, collectionName) {
  var logData = {
    origin: "UserRepository",
    method: "removeUser",
    action: "remove",
    user: {
      id: user.id,
    },
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      db.collection(collectionName).deleteOne({ id: id }, function (err, res) {
        // <--- Here
        if (err) {
          logData["error"] = err;

          logger.error(logData);

          reject(err);
        }

        logData["result"] = "User removed";

        logger.log(logData);

        resolve(true);
      });
    });
  });
}

// ! FIND USER BY FILTER

async function findOneUserByFilter(filter, collectionName) {
  var logData = {
    origin: "UserRepository",
    method: "findUserByFilter",
    action: "find",
    filter: filter,
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.error(logData);
        reject(err);
      }

      var db = client.db(DATABASE);

      db.collection(collectionName).findOne(filter, function (err, res) {
        if (err) {
          logData["error"] = err;

          logger.error(logData);

          reject(err);
        }

        logData["result"] = "User found";

        logger.log(logData);

        resolve(res);
      });
    });
  });
}

async function findManyUsersByFilter(filter, collectionName) {

    var logData = {
        origin: "UserRepository",
        method: "findManyUsersByFilter",
        action: "find",
        filter: filter,
        collectionName: collectionName
    }

    return new Promise((resolve, reject) => {
        mongoClient.connect(CONNECTION, function (err, client) {
            if (err) {
                logData["error"] = err;
                logger.error(logData);
                reject(err);
            }

            var db = client.db(DATABASE);

            db.collection(collectionName).find(filter).toArray(function (err, res) {
                
            })
    })
}

// ! FIND USER BY ID

async function findUserById(id, collectionName) {
  var logData = {
    origin: "UserRepository",
    method: "findUserById",
    action: "find",
  };

  logger.log(logData);

  return await findOneUserByFilter({ id: id }, collectionName);
}

// ! FIND USER BY USERNAME

async function findUserByUsername(username, collectionName) {
  var logData = {
    origin: "UserRepository",
    method: "findUserByUsername",
    action: "find",
  };

  logger.log(logData);

  return await findOneUserByFilter({ username: username }, collectionName);
}

