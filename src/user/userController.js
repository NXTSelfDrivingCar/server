const userRepository = require("./userRepository");
const User = require("./userModel");
const USERS_COLLECTION = "users";
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

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
  var foundUser = userRepository
    .findUserByUsername(user.username, USERS_COLLECTION)
    .then((result) => {
      if (result) {
        console.log(
          "UserController (registerUser) -> User already exists -> " +
            result.username
        );

        logger.log("info", {
          origin: "UserController",
          method: "registerUser",
          action: "registerUser",
          user: {
            id: result.id,
            username: result.username,
          },
          result: "User already exists",
        });

        return null;
      }

      logger.log("info", {
        origin: "UserController",
        method: "registerUser",
        action: "registerUser",
        user: {
          id: user.id,
          username: user.username,
        },
        result: "User registered",
      });

      return userRepository.insertUser(user, USERS_COLLECTION);
    });
  return foundUser;
}

function loginUser(username, password) {
  var foundUser = userRepository
    .findUserByUsername(username, USERS_COLLECTION)
    .then((result) => {
      if (result) {
        if (result.password === password) {
          console.log(
            "UserController (loginUser) -> User logged in -> " + result.username
          );

          logger.log("info", {
            origin: "UserController",
            method: "loginUser",
            action: "loginUser",
            user: {
              id: result.id,
              username: result.username,
            },
            result: "User logged in",
          });

          return result;
        } else {
          return null;
        }
      }

      logger.log("info", {
        origin: "UserController",
        method: "loginUser",
        action: "loginUser",
        user: {
          username: username,
        },
        result: "User not found",
      });

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

async function updateUser(id, user) {
  let logData = {
    origin: "UserController",
    method: "updateUser",
    action: "updateUser",
    user: {
      id: id,
    },
  };

  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);

  console.log("UserController (updateUser) -> " + foundUser.username);

  if (foundUser) {
    logData["result"] = "User updated";
    logger.log("info", logData);

    return await userRepository.updateUser(id, user, USERS_COLLECTION);
  }

  logData["result"] = "User not found";
  logger.log("info", logData);
  return false;
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
