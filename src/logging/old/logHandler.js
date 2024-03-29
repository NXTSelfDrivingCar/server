const path = require("path");
const fs = require("fs");
const { deprecate } = require("util");

const statuses = { OPEN: "OPEN", CLOSED: "CLOSED" };
const tags = { INFO: "INFO", ERROR: "ERROR" };

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}

function fomratTimestampToWrite(timestamp) {
  const date = new Date(timestamp);
  var day = date.getDate();
  var month = String(date.getMonth()).padStart(2, "0");
  var year = date.getFullYear();
  var hours = String(date.getHours()).padStart(2, "0");
  var minutes = String(date.getMinutes()).padStart(2, "0");
  var seconds = String(date.getSeconds()).padStart(2, "0");
  var milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function formatToday(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
}

class LogHandler {
  static currentFIle = null;
  static status = statuses.CLOSED;

  constructor() {
    this.filePath = "./logs/";
  }

  _writeOpener() {
    var starter = [
      {
        timestamp: new Date().getTime(),
        tag: tags.INFO,
        source: "internal_log",
        action: "open",
        message: "Log file opened",
        logName: LogHandler.currentFIle,
      },
    ];

    this.writeToFile(starter);
  }

  open() {
    if (LogHandler.status == statuses.OPEN) return this;

    this._prepareDir();

    LogHandler.status = statuses.OPEN;
    LogHandler.currentFIle = `log_${new Date().getTime()}.json`;

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

  log(tag = tags.INFO, data) {
    const timestamp = new Date().getTime();
    if (!data["tag"]) data["tag"] = tag;

    if (!data["timestamp"]) data["timestamp"] = timestamp;

    data["tag"] = data["tag"].toUpperCase();

    let currentLog = fs.readFileSync(
      this.filePath + LogHandler.currentFIle,
      "utf8"
    );
    let currentLogJson = JSON.parse(currentLog);

    currentLogJson.push(data);

    this.writeToFile(currentLogJson);
  }

  error(data) {
    this.log(tags.ERROR, data);
  }

  getCurrentFile() {
    return LogHandler.currentFIle;
  }

  /**
   *
   * @param {*} data
   * @deprecated Use error(data) instead
   */
  logError(data) {
    this.log(tags.ERROR, data);
  }

  /**
   * Makes sure that the directory for the log files exists
   * @private
   */
  _prepareDir() {
    console.log("Checking for log directory...");
    if (fs.existsSync(this.filePath)) return;

    console.log("Creating log directory...");
    fs.mkdirSync(this.filePath);

    console.log("Log directory created at " + this.filePath);
  }

  /**
   * Writes the data to the file
   * @param {*} data
   * @private
   */

  writeToFile(data) {
    if (LogHandler.status == statuses.CLOSED) return;

    fs.writeFileSync(
      this.filePath + LogHandler.currentFIle,
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) throw err;
      }
    );
  }
}

module.exports = { LogHandler, statuses, tags };
