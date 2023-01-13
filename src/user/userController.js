const userRepository = require("./userRepository");
const User = require("./userModel");
const USERS_COLLECTION = "users";
const bcryptConfig = require("../config/bcryptConfig");

var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();
var bcrypt = require("bcryptjs");

function findUser(user) {
  return userRepository.findUser(user, USERS_COLLECTION);
}

async function findUserByUsername(username) {
  return await userRepository.findUserByUsername(username, USERS_COLLECTION);
}

async function findUserById(id) {
  return await userRepository.findUserById(id, USERS_COLLECTION);
}

async function findUsersByRole(role) {
  return await userRepository.findUsersByRole(role, USERS_COLLECTION);
}

async function filterSearch(filters) {
  return await userRepository.filterSearch(filters, USERS_COLLECTION);
}
/**
 * Inserts a user into the database
 * @param {User} user User object to be inserted
 * @returns {User} User object that was inserted or `null` if the user already exists
 */
function registerUser(user) {
  var logData = {
    origin: "UserController",
    method: "registerUser",
    action: "register",
    user: {
      username: user.username,
      id: user.id,
    },
  };

  var foundUser = userRepository
    .findUserByUsername(user.username, USERS_COLLECTION)
    .then((result) => {
      if (result) {
        console.log(
          "UserController (registerUser) -> User already exists -> " +
            result.username
        );

        logData["result"] = "User already exists";

        logger.log("info", logData);

        return null;
      }

      logData["result"] = "User registered";

      logger.log("info", logData);

      // Encypting password
      user.password = bcrypt.hashSync(user.password, bcryptConfig.SALT);

      return userRepository.insertUser(user, USERS_COLLECTION);
    });
  return foundUser;
}

function loginUser(username, password) {
  var logData = {
    origin: "UserController",
    method: "loginUser",
    action: "login",
  };

  var foundUser = userRepository
    .findUserByUsername(username, USERS_COLLECTION)
    .then((result) => {
      if (result) {
        // Comparing passwords
        if (bcrypt.compareSync(password, result.password)) {
          console.log(
            "UserController (loginUser) -> User logged in -> " + result.username
          );

          logData["user"] = {
            id: result.id,
            username: result.username,
          };

          logData["result"] = "User logged in";

          logger.log("info", logData);

          return result;
        } else {
          return null;
        }
      }

      logData["user"] = {
        username: username,
      };
      logData["result"] = "User not found";

      logger.log("info", logData);

      return null;
    });
  return foundUser;
}

async function removeUser(id) {
  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);

  if (foundUser) {
    return userRepository.removeUser(id, USERS_COLLECTION);
  }

  return null;
}

async function checkAdmin(id) {
  let logData = {
    origin: "UserController",
    method: "checkAdmin",
    action: "checkAdmin",
    user: {
      id: id,
    },
  };

  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);
  if (foundUser) {
    if (foundUser.role === "admin") {
      console.log(
        "UserController (checkAdmin) -> User is admin -> " + foundUser.username
      );
      logData["result"] = "User is admin";
      logger.log("info", logData);
      return true;
    }

    console.log(
      "UserController (checkAdmin) -> User is not admin -> " +
        foundUser.username
    );

    logData["result"] = "User is not admin";
    logger.log("info", logData);
  }

  return false;
}

async function updateUser(id, user, type) {
  let logData = {
    origin: "UserController",
    method: "updateUser",
    action: "updateUser",
    user: {
      id: id,
    },
  };

  if (type === "password") {
    console.log(
      "UserController (updateUser) user password -> " + user.password
    );

    user.password = bcrypt.hashSync(user.password, bcryptConfig.SALT);

    console.log(
      "UserController (updateUser) user password -> " + user.password
    );
  }

  if (type === "username") {
    var foundUser = await userRepository.findUserByUsername(
      user.username,
      USERS_COLLECTION
    );

    if (foundUser) {
      logData["result"] = "Username already exists";
      logger.log("info", logData);
      return null;
    }
  }

  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);

  console.log("UserController (updateUser) -> " + foundUser.username);

  if (foundUser) {
    logData["result"] = "User updated";
    logger.log("info", logData);

    return await userRepository.updateUser(id, user, USERS_COLLECTION);
  }

  logData["result"] = "User not found";
  logger.log("info", logData);
  return null;
}

module.exports = {
  findUser,
  registerUser,
  removeUser,
  loginUser,
  checkAdmin,
  findUsersByRole,
  findUserById,
  filterSearch,
  updateUser,
};
