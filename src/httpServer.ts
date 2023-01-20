import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

// json web token
import jwt from "jsonwebtoken";
import cookies from "cookie-parser";

// Import logger
import { LogHandler } from "./logging/logHandler";
const logger = new LogHandler();

// Express server setup
const PORT = process.env.HTTP_SERVER_PORT;

var app: Express = express();

app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

const httpServerConfig = require("./config/httpServerConfig");

// Import routes
const guestRoutes = require ("./routes/guestRoutes")(app);
const userRoutes = require ("./routes/userRoutes")(app);
const sharedRoutes = require ("./routes/sharedRoutes")(app);
const adminRoutes = require ("./routes/adminRoutes")(app);

// Start server
app.listen(httpServerConfig.PORT, () => {
    logger.log( {
        action: "startServer",
        details: { serverType: "HttpServer", port: httpServerConfig.PORT },
      });
    console.log(`HTTP Server listening on port ${httpServerConfig.PORT}`);
});



// var dotenv = require("dotenv").config({ path: ".env" });
// var { LogHandler } = require("./logging/logHandler.js");
// var { getUserWithToken } = require("./public/util");
// var express = require("express");
// var path = require("path");
// var User = require("./user/userModel");
// var cookies = require("cookie-parser");
// var jwt = require("jsonwebtoken");
// var wildcard = require("socketio-wildcard")();
