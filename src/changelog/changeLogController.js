const userRepository = require("./changeLogRepository");
const ChangeLog = require("./changeLogModel");
const CHANGELOG_COLLECTION = "changeLog";

var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

async function addChangelog(changelog) {
  return await userRepository.insertChangeLog(changelog, CHANGELOG_COLLECTION);
}

module.exports = {
  addChangelog,
};
