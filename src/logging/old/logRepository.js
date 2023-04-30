const fs = require("fs");

function getAllLogs() {
  return new Promise((resolve, reject) => {
    fs.readdir("./logs", (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

function getLog(logName) {
  return new Promise((resolve, reject) => {
    fs.readFile(`./logs/${logName}`, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function deleteLog(logName) {
  return new Promise((resolve, reject) => {
    fs.unlink(`./logs/${logName}`, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = {
  getAllLogs: getAllLogs,
  getLog: getLog,
  deleteLog: deleteLog,
};
