const dotenv = require("dotenv").config({ path: ".env" });

module.exports = {
  URL: dotenv.parsed["MONGODB_URL"],
  DATABASE: dotenv.parsed["MONGODB_DATABASE"],
  PORT: dotenv.parsed["MONGODB_PORT"],
  CONNECTION: `${dotenv.parsed["MONGODB_URL"]}:${dotenv.parsed["MONGODB_PORT"]}`,
};
