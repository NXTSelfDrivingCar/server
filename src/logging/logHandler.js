const path = require("path");
const fs = require("fs");

const statuses = { OPEN: "OPEN", CLOSED: "CLOSED" };
const tags = { INFO: "INFO", ERROR: "ERROR" };

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}

function formatToday(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
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
    LogHandler.currentFIle = `log_${formatTimestamp(new Date().getTime())}.log`;

    this.log(tags.INFO, "internal_log", "open", "Log file opened");

    return this;
  }

  close() {
    LogHandler.status = statuses.CLOSED;
    LogHandler.currentFIle = null;

    this.log(tags.INFO, "internal_log", "close", "Log file opened");

    return this;
  }

  // TODO: Dodati da se umesto message, tavlja objekat koji se pretvara u JSON ili parmas objekata
  log(tag, route, fun, message) {
    if (LogHandler.status == statuses.CLOSED) return;

    const timestamp = formatTimestamp(new Date().getTime());
    const data = `[${tag}] [${timestamp}] [${route}] [${fun}]: "${message}"\r\n`;

    fs.appendFile(this.filePath + LogHandler.currentFIle, data, (err) => {
      if (err) throw err;
    });
  }
}

module.exports = { LogHandler, statuses, tags };
