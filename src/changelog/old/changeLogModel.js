const uuid = require("uuid");
class ChangeLog {
  constructor(title, version, isBeta = false, description) {
    this.id = uuid.v4();
    this.title = title;
    this.version = version;
    this.description = description;
    this.isBeta = isBeta == "on" ? true : false;
    this.date = new Date(); // Proveriti da li ovo radi kako treba
  }

  toString() {
    return `Title: ${this.title}, Date: ${this.date}, \nVersion: ${this.version}, \nIsBeta: ${this.isBeta}, \nDescription: ${this.description} `;
  }
}

module.exports = ChangeLog;
