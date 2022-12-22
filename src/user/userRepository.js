var mongoClient = require("mongodb").MongoClient;

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
        returnValue = false;
      }
      console.log("UserRepository (insertUser) -> 1 document inserted");
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
function removeUser(user, collectionName) {
  var deleted = false;

  var found = findUserByUsername(user.username, collectionName).then((res) => {
    if (res) {
      mongoClient.connect(CONNECTION, function (err, client) {
        var db = client.db(DATABASE);

        db.collection(collectionName).deleteOne(res, function (err, res) {
          if (err) {
            throw err;
          }
          console.log("UserRepository (deleteUser) -> 1 document deleted");
          deleted = true;
        });
      });
    }
    deleted = false;
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
          if (err) throw err;

          // Return the user object

          // console.log(
          //   "UserRepository (findUserByUsername) -> " + result.username
          // );
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
        if (err) throw err;

        // Return the user object
        // console.log("UserRepository (findUserById) -> " + result.username);
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
          if (err) throw err;

          // Return the user object
          // console.log("UserRepository (findUsersByRole) -> " + result.username);
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
          if (err) throw err;

          // Return the user object
          // console.log("UserRepository (filterSearch) -> " + result.username);
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
          if (err) throw err;
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
