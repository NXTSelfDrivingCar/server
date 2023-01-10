const changelogRepository = require("./changeLogRepository");
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
  // TODO: Ukloniti error throwing i zameniti logovanjem
  if (changelog == null) {
    throw new Error("Changelog cannot be null");
  }

  let versionCheck = await changelogRepository.getLogByVersion(
    changelog.version,
    CHANGELOG_COLLECTION
  );

  if (versionCheck != null) {
    throw new Error("Changelog with this version already exists");
  }

  return await changelogRepository.insertChangeLog(
    changelog,
    CHANGELOG_COLLECTION
  );
}
/**
 * This returns the changelog with the specified version
 * @param {string} version string filter for the version of the changelog
 * @returns {ChangeLog} returns the changelog with the specified version
 */
async function getLogByVersion(version) {
  if (version == null) {
    throw new Error("Version cannot be null");
  }

  return await changelogRepository.getLogByVersion(
    version,
    CHANGELOG_COLLECTION
  );
}

/**
 * This returns the array of latest changelogs found in the database
 * @param {int|1} limit limits the number of output elements. Default 1
 * @returns {Document[]} returns the array of latest logs
 */
async function getLatestChangeLogs(limit = 1) {
  documents = await changelogRepository.getLatestChangeLogs(
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
