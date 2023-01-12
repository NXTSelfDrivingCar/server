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

function jsonFromKeys(jsonData, ommit = false, ...keys) {
  var result = {};

  if (ommit) {
    for (var key in jsonData) {
      if (!isInArray(key, keys)) {
        result[key] = jsonData[key];
      }
    }
    return result;
  }

  for (var i = 0; i < keys.length; i++) {
    result[keys[i]] = jsonData[keys[i]];
  }
  return result;
}

function objectArrayToString(objectArray, ...keys) {
  if (keys.length > 0) {
    return objectArray.map((object) => jsonToString(object, ...keys));
  }
  return objectArray.map((object) => jsonToString(object));
}

function objectArrayToJSON(objectArray, ...keys) {
  if (keys.length > 0) {
    return objectArray.map((object) => jsonFromKeys(object, ...keys));
  }
  return objectArray.map((object) => jsonFromKeys(object));
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
  console.log("Get user with token");
  console.log("Cookies: ");
  console.log(req.cookies);

  if (req.cookies.auth) {
    var decoded = jwt.verify(
      req.cookies.auth,
      process.env.JWT_SECRET,
      // Dodata funkcija u slucaju da je token istekao
      // Ako je token istekao, vraca null i to dozvoljava da se vrati guest korisnik
      function (err, decoded) {
        if (err) {
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
      decoded.user.role,
      decoded.user.id
    );

    return newUser;
  } else {
    // return guest user
    return new User("guest", "guest", "guest", "guest", "guest");
  }
}

/**
 * Checks if json data has all the keys from json format
 * @param {*} jsonData Json data to check
 * @param {*} jsonFormat Json format to check against
 * @returns True if json data has all the keys from json format
 */
function checkJsonFormat(jsonData, jsonFormat) {
  for (var key in jsonFormat) {
    if (jsonData[key] == undefined) {
      return false;
    }
  }
  return true;
}

function isEmpty(dictionary) {
  return Object.keys(dictionary).length === 0;
}

module.exports = {
  jsonToString: jsonToString,
  objectArrayToString: objectArrayToString,
  isInArray: isInArray,
  getUserWithToken: getUserWithToken,
  objectArrayToJSON: objectArrayToJSON,
  jsonFromKeys: jsonFromKeys,
  checkJsonFormat: checkJsonFormat,
  isEmpty: isEmpty,
};
