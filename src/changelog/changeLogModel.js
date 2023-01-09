const uuid = require("uuid");
class ChangeLog {
  constructor(title, version, isBeta = false, description) {
    this.id = uuid.v4();
    this.title = title;
    this.version = version;
    this.isBeta = isBeta;
    this.description = description;
    this.date = new Date(); // Proveriti da li ovo radi kako treba
  }
}

module.exports = ChangeLog;
