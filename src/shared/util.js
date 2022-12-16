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

module.exports = {
  jsonToString: jsonToString,
  objectArrayToString: objectArrayToString,
};
