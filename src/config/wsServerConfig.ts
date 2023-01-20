import dotenv from "dotenv";
dotenv.config({ path: ".env" });

module.exports = {
    WS_HOST: process.env.WS_SERVER_HOST,
    WS_PORT: process.env.WS_SERVER_PORT,
    WS_CONNECTION: `${process.env.WS_SERVER_HOST}:${process.env.WS_SERVER_PORT}`,
}