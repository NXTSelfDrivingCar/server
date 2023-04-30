import { LogHandler } from "../logging/logHandler";
import { Request, Response } from "express";
import { Authorization } from "./authorization";

const logger = new LogHandler();

export class RouteWatcher{

    public static logRoute(action: string, extra: any = {}) {
        return (req: Request, res: Response, next: any) => {
            RouteWatcher._logRoute(req, res, next, action, extra);
            next();
        }
    }

    
    private static async _logRoute(req: Request, res: Response, next: any, action: string, extra: any){
        
        // Begins writing log data
        var logData: any = {
            origin: "route",
            action: action,
            method: req.method,
            url: req.url,
            path: req.path,
            headers: req.headers,
            ip: req.ip,
            cookies: req.cookies,
        }

        /* 
            Writes extra data to logData if it is not empty
            Also writes body, query and params if they are not empty
        */

        var user = await Authorization.getUserFromCookie("auth", req);

        if (user) {
            logData['user'] = {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email,
            }
        }

        if (JSON.stringify(extra) !== "{}") logData["content"] = extra;

        if (JSON.stringify(req.body) !== "{}") logData["body"] = req.body;

        if (JSON.stringify(req.query) !== "{}") logData["query"] = req.query;

        if (JSON.stringify(req.params) !== "{}") logData["params"] = req.params;

        logger.info(logData);
    }

}