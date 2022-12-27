const dotenv = require("dotenv").config({ path: ".env" });

module.exports = {
  HTTP_HOST: dotenv.parsed["HTTP_SERVER_HOST"],
  HTTP_PORT: dotenv.parsed["HTTP_SERVER_PORT"],
  WS_HOST: dotenv.parsed["WS_SERVER_HOST"],
  WS_PORT: dotenv.parsed["WS_SERVER_PORT"],
  HTTP_CONNECTION: `${dotenv.parsed["HTTP_SERVER_HOST"]}:${dotenv.parsed["HTTP_SERVER_PORT"]}`,
  WS_CONNECTION: `${dotenv.parsed["WS_SERVER_HOST"]}:${dotenv.parsed["WS_SERVER_PORT"]}`,
};
