const userRepository = require("./userRepository");
const User = require("./userModel");
const USERS_COLLECTION = "users";

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
        return null;
      }
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
          return result;
        } else {
          return null;
        }
      }
      return null;
    });
  return foundUser;
}

async function removeUser(username) {
  var foundUser = await userRepository.findUserByUsername(
    username,
    USERS_COLLECTION
  );

  if (foundUser) {
    return userRepository.removeUser(user, USERS_COLLECTION);
  }
  return null;
}

async function checkAdmin(id) {
  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);
  if (foundUser) {
    if (foundUser.role === "admin") {
      console.log(
        "UserController (checkAdmin) -> User is admin -> " + foundUser.username
      );
      return true;
    }
  }
  console.log(
    "UserController (checkAdmin) -> User is not admin -> " + foundUser.username
  );
  return false;
}

async function updateUser(id, user) {
  var foundUser = await userRepository.findUserById(id, USERS_COLLECTION);
  console.log("UserController (updateUser) -> " + foundUser.username);
  if (foundUser) {
    return await userRepository.updateUser(id, user, USERS_COLLECTION);
  }
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
