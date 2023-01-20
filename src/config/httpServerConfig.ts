import dotenv from "dotenv";

dotenv.config({ path: ".env" });

module.exports = {
  HOST: process.env.HTTP_SERVER_HOST,
  PORT: process.env.HTTP_SERVER_PORT,

  CONNECTION: `${process.env.HTTP_SERVER_HOST}:${process.env.HTTP_SERVER_PORT}`,
};
