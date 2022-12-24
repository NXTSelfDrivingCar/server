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

  _writeOpener() {
    var starter = [
      {
        timestamp: formatTimestamp(new Date().getTime()),
        tag: tags.INFO,
        source: "internal_log",
        action: "open",
        message: "Log file opened",
      },
    ];

    var jsonData = JSON.stringify(starter, null, 2);
    fs.writeFileSync(
      this.filePath + LogHandler.currentFIle,
      jsonData,
      (err) => {
        if (err) throw err;
      }
    );
  }

  open() {
    if (LogHandler.status == statuses.OPEN) return this;

    LogHandler.status = statuses.OPEN;
    LogHandler.currentFIle = `log_${formatTimestamp(
      new Date().getTime()
    )}.json`;

    this._writeOpener();

    return this;
  }

  close() {
    LogHandler.status = statuses.CLOSED;
    LogHandler.currentFIle = null;

    this.log(tags.INFO, {
      source: "internal_log",
      action: "close",
      message: "Log file closed",
    });

    return this;
  }

  // TODO: Dodati da se umesto message, tavlja objekat koji se pretvara u JSON ili parmas objekata
  log(tag = tags.INFO, data) {
    if (LogHandler.status == statuses.CLOSED) return;

    const timestamp = formatTimestamp(new Date().getTime());
    if (!data["tag"]) data["tag"] = tag;

    if (!data["timestamp"]) data["timestamp"] = timestamp;

    let currentLog = fs.readFileSync(
      this.filePath + LogHandler.currentFIle,
      "utf8"
    );
    let currentLogJson = JSON.parse(currentLog);

    currentLogJson.push(data);

    fs.writeFileSync(
      this.filePath + LogHandler.currentFIle,
      JSON.stringify(currentLogJson, null, 2),
      (err) => {
        if (err) throw err;
      }
    );
  }

  logError(data) {
    this.log(tags.ERROR, data);
  }
}

module.exports = { LogHandler, statuses, tags };
