var jwt = require("jsonwebtoken");
var User = require("../user/userModel");
var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

function jsonToString(jsonData, ...keys) {
  if (keys.length > 0) {
    var result = "";
    for (var i = 0; i < keys.length; i++) {
      result += jsonData[keys[i]] + " ";
    }
    return result;
  }
  return JSON.stringify(jsonData);
}

function objectArrayToString(objectArray, ...keys) {
  if (keys.length > 0) {
    return objectArray.map((object) => jsonToString(object, ...keys));
  }
  return objectArray.map((object) => jsonToString(object));
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns User from token (guest if no token is found)
 */
function getUserWithToken(req, res) {
  if (req.cookies.auth) {
    var decoded = jwt.verify(
      req.cookies.auth,
      process.env.JWT_SECRET,

      // Dodata funkcija u slucaju da je token istekao
      // Ako je token istekao, vraca null i to dozvoljava da se vrati guest korisnik
      function (err, decoded) {
        if (err) {
          logger.log("ERROR", "getUserWithToken", "jwt.verify", err);
          return null;
        }
        return decoded;
      }
    );

    if (decoded == null) {
      return new User("guest", "guest", "guest", "guest", "guest");
    }
    // make a new user from decoded token
    var newUser = new User(
      decoded.user.username,
      decoded.user.password,
      decoded.user.email,
      decoded.user.nxt_api_key,
      decoded.user.role
    );

    return newUser;
  } else {
    // return guest user
    return new User("guest", "guest", "guest", "guest", "guest");
  }
}

module.exports = {
  jsonToString: jsonToString,
  objectArrayToString: objectArrayToString,
  isInArray: isInArray,
  getUserWithToken: getUserWithToken,
};
