const logRepostiory = require("../old/logRepository");

function getAllLogs() {
  return logRepostiory.getAllLogs();
}

function getLog(logName) {
  return logRepostiory.getLog(logName);
}

function deleteLog(logName) {
  return logRepostiory.deleteLog(logName);
}

module.exports = {
  getAllLogs: getAllLogs,
  getLog: getLog,
  deleteLog: deleteLog,
};
