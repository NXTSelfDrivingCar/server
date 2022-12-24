var mongoClient = require("mongodb").MongoClient;
var User = require("./userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

const CONNECTION = "mongodb://host.docker.internal:27017";
const DATABASE = "testDB";

/**
 *
 * @param {User} user User object to be inserted
 * @param {String} collectionName Name of the collection to insert the user into
 * @returns {User} User object that was inserted or `null`
 */
async function insertUser(user, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "insertUser",
    user: {
      id: user._id,
      username: user.username,
    },
    collectionName: collectionName,
  };

  var returnValue = false;

  mongoClient.connect(CONNECTION, function (err, client) {
    if (err) {
      logData["error"] = err;
      logger.logError(logData);
      throw err;
    }

    var db = client.db(DATABASE);

    db.collection(collectionName).insertOne(user, function (err, res) {
      if (err) {
        console.log("There has been an error inserting the user" + err);
        logData["error"] = err;
        logger.logError(logData);
        returnValue = false;
      }
      console.log("UserRepository (insertUser) -> 1 document inserted");

      logData["result"] = "User inserted";
      logger.log("info", logData);
      returnValue = true;
    });
  });

  return returnValue;
}
/**
 * Removes a user from the database
 * @param {User} user User object to be removed
 * @param {String} collectionName Name of the collection to remove the user from
 * @returns {User} User object that was removed or `null`
 *
 */
function removeUser(id, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "removeUser",
    user: {
      id: id,
    },
    collectionName: collectionName,
  };

  var deleted = false;

  mongoClient.connect(CONNECTION, function (err, client) {
    if (err) {
      logData["error"] = err;
      logger.logError(logData);
      throw err;
    }

    var db = client.db(DATABASE);

    var myquery = { id: id };

    db.collection(collectionName).deleteOne(myquery, function (err, obj) {
      if (err) {
        console.log("There has been an error deleting the user" + err);
        logData["error"] = err;
        logger.logError(logData);

        deleted = false;
      }
      console.log("UserRepository (removeUser) -> 1 document deleted");

      logData["result"] = "User deleted";
      logger.log("info", logData);

      deleted = true;
    });
  });

  return deleted;
}

/**
 *
 * @param {String} uname Username of the user to be found
 * @param {String} collectionName Name of the collection to find the user in
 * @returns {User} User object that was found or `null`
 */
function findUserByUsername(uname, collectionName) {
  // Promises are used to handle asynchronous operations

  let logData = {
    origin: "UserRepository",
    method: "findUserByUsername",
    user: {
      username: uname,
    },
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.logError(logData);
        throw err;
      }

      var db = client.db(DATABASE);

      // Find the user with the specified username
      db.collection(collectionName).findOne(
        { username: uname },
        function (err, result) {
          if (err) {
            logData["error"] = err;
            logger.logError(logData);
            throw err;
          }

          logData["result"] = {
            user: {
              id: result._id,
              username: result.username,
              role: result.role,
            },
          };
          logger.log("info", logData);
          resolve(result);
        }
      );
    });
  });
}

function findUserById(id, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "findUserById",
    user: {
      id: id,
    },
    collectionName: collectionName,
  };
  // Promises are used to handle asynchronous operations
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.logError(logData);
        throw err;
      }

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName).findOne({ id: id }, function (err, result) {
        if (err) {
          logData["error"] = err;
          logger.logError(logData);
          throw err;
        }

        logData["result"] = {
          user: {
            id: result._id,
            username: result.username,
            role: result.role,
          },
        };
        logger.log("info", logData);

        resolve(result);
      });
    });
  });
}

function findUsersByRole(role, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "findUsersByRole",
    user: {
      role: role,
    },
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.logError(logData);
        throw err;
      }

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName)
        .find({ role: role })
        .toArray(function (err, result) {
          if (err) {
            logData["error"] = err;
            logger.logError(logData);
            throw err;
          }

          logData["result"] = "Fetch complete";
          resolve(result);
        });
    });
  });
}

function filterSearch(filter, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "filterSearch",
    filter: filter,
    collectionName: collectionName,
  };

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.logError(logData);
        throw err;
      }

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName)
        .find(filter)
        .toArray(function (err, result) {
          if (err) {
            logData["error"] = err;
            logger.logError(logData);
            throw err;
          }

          logData["result"] = "Fetch complete";
          resolve(result);
        });
    });
  });
}

function updateUser(id, user, collectionName) {
  let logData = {
    origin: "UserRepository",
    method: "updateUser",
    user: {
      id: id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    collectionName: collectionName,
  };

  console.log("UserRepository (updateUser) -> " + user.username, " ", id);

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) {
        logData["error"] = err;
        logger.logError(logData);
        throw err;
      }

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName).updateOne(
        { id: id },
        {
          $set: {
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
        function (err, result) {
          if (err) {
            logData["error"] = err;
            logger.logError(logData);
            throw err;
          }
          logData["result"] = "Update complete";
          logger.log("info", logData);
          resolve(true);
        }
      );
    });
  });
}

module.exports = {
  insertUser,
  removeUser,
  findUserByUsername,
  findUserById,
  findUsersByRole,
  filterSearch,
  updateUser,
};
