import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

// json web token
import jwt from "jsonwebtoken";
import cookies from "cookie-parser";

// Import HTTP server config
import { HttpServerConfig } from "./config/server/httpServerConfig";

// Import logger
import { LogHandler } from "./logging/logHandler";
const logger = new LogHandler();

// Import WebSocket server
import { WebSocketServer } from "./webSocket/WebSocketServer";
import { WSSConfig } from "./config/server/wsServerConfig";
import { createServer } from "http";

import { EmailHandler } from "./emailHandler/emailHandler";
import { EmailConfig } from "./config/shared/emailConfig";


var app: Express = express();

app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Import routes
const guestRoutes = require ("./routes/guestRoutes")(app);
const userRoutes = require ("./routes/userRoutes")(app);
const adminRoutes = require ("./routes/adminRoutes")(app);
const ajaxRoutes = require ("./routes/ajaxRoutes")(app);
const sharedRoutes = require ("./routes/sharedRoutes")(app);

// Start server
app.listen(HttpServerConfig.PORT, () => {
    logger.log( {
        origin: "HttpServer",
        action: "init",
        details: { serverType: "HttpServer", port: HttpServerConfig.PORT },
      });
      console.log("Running server on version: 1.1.5.3.1 - WebSocket (alpha) / Streamer (alpha 3)");
      
    console.log(`HTTP Server listening on port ${HttpServerConfig.PORT}`);
});

// Start WebSocket server
const httpServer = createServer(app);
const wss = new WebSocketServer(httpServer);
wss.init(WSSConfig.PORT);

const connectionHandler = require("./webSocket/WebSocketConnectionHandler")(wss.getIO());
//const adminHandler = require("./webSocket/WebSocketAdminHandler")(wss.getIO());

const emailHandler = new EmailHandler(EmailConfig.USER, EmailConfig.PASS);
emailHandler.init();