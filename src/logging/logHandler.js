const path = require("path");
const fs = require("fs");

const statuses = { OPEN: "OPEN", CLOSED: "CLOSED" };
const tags = { INFO: "INFO", ERROR: "ERROR" };

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

class LogHandler {
  static currentFIle = null;
  static status = statuses.CLOSED;

  constructor() {
    this.filePath = path.join("./", "log/");
  }

  open() {
    if (LogHandler.status == statuses.OPEN) return this;

    LogHandler.status = statuses.OPEN;
    LogHandler.currentFIle = `log_${new Date().getTime().toString()}.txt`;

    this.log(tags.INFO, "Log file opened");

    return this;
  }

  close() {
    LogHandler.status = statuses.CLOSED;
    LogHandler.currentFIle = null;

    this.log(tags.INFO, "Log file closed");

    return this;
  }

  log(tag, message) {
    if (LogHandler.status == statuses.CLOSED) return;

    const timestamp = formatTimestamp(new Date().getTime());
    const data = `[${tag}] [${timestamp}]: "${message}"\r\n`;

    fs.appendFile(this.filePath + LogHandler.currentFIle, data, (err) => {
      if (err) throw err;
    });
  }
}

module.exports = { LogHandler, statuses, tags };
