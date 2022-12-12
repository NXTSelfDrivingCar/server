const userRepository = require("./userRepository");
const User = require("./userModel");
const USERS_COLLECTION = "users";

function findUser(user) {
  return userRepository.findUser(user, USERS_COLLECTION);
}

function findUserByUsername(username) {
  return userRepository.findUserByUsername(username, USERS_COLLECTION);
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
        console.log("User already exists");
        return null;
      }
      return userRepository.insertUser(user, USERS_COLLECTION);
    });
}

function removeUser(user) {
  return userRepository.removeUser(user, USERS_COLLECTION);
}

module.exports = { findUser, registerUser, removeUser };
