const userRepository = require("./changeLogRepository");
const ChangeLog = require("./changeLogModel");
const CHANGELOG_COLLECTION = "changeLog";

var { LogHandler } = require("../logging/logHandler");
var logger = new LogHandler().open();

/**
 * This adds the changelog to the database
 * @param {ChangeLog} changelog changelog to be added to the database
 * @returns {ChangeLog} returns the changelog that was added to the database
 * @throws {Error} throws an error if the changelog is not valid
 *
 * @example
 * // returns the changelog that was added to the database
 *
 * addChangelog(new ChangeLog("title", "version", "description"))
 *
 */
async function addChangelog(changelog) {
  // TODO: Add validation for the changelog version
  return await userRepository.insertChangeLog(changelog, CHANGELOG_COLLECTION);
}
/**
 * This returns the changelog with the specified version
 * @param {string} version string filter for the version of the changelog
 * @returns {ChangeLog} returns the changelog with the specified version
 */
async function getLogByVersion(version) {
  return await userRepository.getLogByVersion(version, CHANGELOG_COLLECTION);
}

/**
 * This returns the array of latest changelogs found in the database
 * @param {int|1} limit limits the number of output elements. Default 1
 * @returns {Document[]} returns the array of latest logs
 */
async function getLatestChangeLogs(limit = 1) {
  documents = await userRepository.getLatestChangeLogs(
    limit,
    CHANGELOG_COLLECTION
  );

  if (documents == null) {
    return null;
  }

  return documents;
}

module.exports = {
  addChangelog,
  getLogByVersion,
  getLatestChangeLogs,
};
