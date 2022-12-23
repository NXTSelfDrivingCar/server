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
  var returnValue = false;

  mongoClient.connect(CONNECTION, function (err, client) {
    if (err) throw err;

    var db = client.db(DATABASE);

    db.collection(collectionName).insertOne(user, function (err, res) {
      if (err) {
        console.log("There has been an error inserting the user" + err);

        logger.log("ERROR", "UserRepository", "insertUser", err);

        returnValue = false;
      }
      console.log("UserRepository (insertUser) -> 1 document inserted");

      logger.log("INFO", "UserRepository", "insertUser", "1 document inserted");

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
  var deleted = false;

  mongoClient.connect(CONNECTION, function (err, client) {
    if (err) throw err;

    var db = client.db(DATABASE);

    var myquery = { id: id };

    db.collection(collectionName).deleteOne(myquery, function (err, obj) {
      if (err) {
        console.log("There has been an error deleting the user" + err);

        logger.log("ERROR", "UserRepository", "removeUser", err);

        deleted = false;
      }
      console.log("UserRepository (removeUser) -> 1 document deleted");

      logger.log("INFO", "UserRepository", "removeUser", "1 document deleted");

      deleted = true;
    });
  });

  return deleted;
}

/**
 *
 * @param {User} user Specifies the user to be found
 * @param {String} collectionName Name of the collection to find the user in
 * @returns
 */
function findUser(user, collectionName) {
  // Ova funkcija ne radi kako treba
  return db
    .collection(collectionName)
    .find(user)
    .toArray(function (err, result) {
      if (err) throw err;
      return result;
    });
}

/**
 *
 * @param {String} uname Username of the user to be found
 * @param {String} collectionName Name of the collection to find the user in
 * @returns {User} User object that was found or `null`
 */
function findUserByUsername(uname, collectionName) {
  // Promises are used to handle asynchronous operations
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) throw err;

      var db = client.db(DATABASE);

      // Find the user with the specified username
      db.collection(collectionName).findOne(
        { username: uname },
        function (err, result) {
          if (err) {
            logger.log("ERROR", "UserRepository", "findUserByUsername", err);
            throw err;
          }

          logger.log(
            "INFO",
            "UserRepository",
            "findUserByUsername",
            "User found"
          );

          resolve(result);
        }
      );
    });
  });
}

function findUserById(id, collectionName) {
  // Promises are used to handle asynchronous operations
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) throw err;

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName).findOne({ id: id }, function (err, result) {
        if (err) {
          logger.log("ERROR", "UserRepository", "findUserById", err);
          throw err;
        }

        logger.log("INFO", "UserRepository", "findUserById", "User found");
        resolve(result);
      });
    });
  });
}

function findUsersByRole(role, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) throw err;

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName)
        .find({ role: role })
        .toArray(function (err, result) {
          if (err) {
            logger.log("ERROR", "UserRepository", "findUsersByRole", err);
            throw err;
          }

          logger.log(
            "INFO",
            "UserRepository",
            "findUsersByRole",
            "Users found"
          );
          resolve(result);
        });
    });
  });
}

function filterSearch(filter, collectionName) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) throw err;

      var db = client.db(DATABASE);

      // Find the user with the specified id
      db.collection(collectionName)
        .find(filter)
        .toArray(function (err, result) {
          if (err) {
            logger.log("ERROR", "UserRepository", "filterSearch", err);
            throw err;
          }

          logger.log("INFO", "UserRepository", "filterSearch", "Users found");
          resolve(result);
        });
    });
  });
}

function updateUser(id, user, collectionName) {
  console.log("UserRepository (updateUser) -> " + user.username, " ", id);

  return new Promise((resolve, reject) => {
    mongoClient.connect(CONNECTION, function (err, client) {
      if (err) throw err;

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
            logger.log("ERROR", "UserRepository", "updateUser", err);
            throw err;
          }

          logger.log("INFO", "UserRepository", "updateUser", "User updated");
          resolve(true);
        }
      );
    });
  });
}

module.exports = {
  insertUser,
  findUser,
  removeUser,
  findUserByUsername,
  findUserById,
  findUsersByRole,
  filterSearch,
  updateUser,
};
