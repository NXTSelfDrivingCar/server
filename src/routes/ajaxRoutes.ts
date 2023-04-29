import { Application, Request, Response } from "express";

import { LogHandler } from "../logging/logHandler";
import { LogController } from "../logging/logController";

import { Authorization } from "../cookie/authorization";

import { ChangelogController } from "../changelog/changelogController";
import { UserController } from "../user/userController";
import { RestartLinkController } from "../restartLink/restartLinkController";

import { EmailHandler } from "../emailHandler/emailHandler";
import { EmailMessage } from "../emailHandler/messageModel";
import { RouteWatcher } from "../cookie/routeWatcher";


const logger = new LogHandler();

const changelogController = new ChangelogController();
const userController = new UserController();
const restartLinkController = new RestartLinkController();
const logController = new LogController();

module.exports = function(app: Application){

    // ! =================== GET ROUTES =================== //
    

    app.get("/api/user/:username", async (req: Request, res: Response) => {
        var username = req.params.username;


        if(!username) return res.json({error: "No ID provided"});

        var user = await userController.findUserByFilter({username: username});


        if(!user) return res.json({error: "User not found"});

        res.json({email: user.email});
    })

    app.get("/api/changelog", async (req: Request, res: Response) => {
        res.json(await changelogController.getChangelogs());
    })

    app.get("/api/admin/users", Authorization.authRole("admin"), async (req: Request, res: Response) => {
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        res.json(await userController.findUsersByFilter(req.query));
    })

    app.get("/api/admin/logs/l/:name", Authorization.authRole("admin"), async (req: Request, res: Response) => {
        var name = req.params.name;

        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        if(!name) return res.json({error: "No name provided"});
        
        res.json(await logController.getLogValueByFilter(name, req.query));
    })

    app.get("/api/admin/emailservice/verify", RouteWatcher.logRoute("emailServiceVerification"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        EmailHandler.getInstance().init().then((data) => {
            res.json({status: "OK"});
        }).catch((err) => {
            res.json({status: "ERROR"});
        })
    });

    // ! =================== POST ROUTES =================== //

    app.post("/api/admin/emailservice/update", RouteWatcher.logRoute("emailServiceUpdate"), Authorization.authRole("admin"), Authorization.authUser(), async (req: Request, res: Response) => {
        var username = req.body.emailUsername;
        var password = req.body.emailPassword;

        if(!username || !password) return res.json({error: "No username or password provided"});

        EmailHandler.getInstance().setUser(username);
        EmailHandler.getInstance().setPass(password);

        res.json({success: "Email service updated"});
    });

    app.post("/api/user/password/reset/", async (req: Request, res: Response) => {

        var to = req.body.email;

        restartLinkController.createRestartLink(req.body.username).then(async (data) => {
            if(data.acknowledged){
                var link = await restartLinkController.getRestartLinkByObjectId(data.insertedId);

                EmailHandler.getInstance().sendEmail(new EmailMessage(to, "Password reset", "Click the link to reset your password: " + link.link));
            }
        });

        res.json({success: "Restart link created"});
    })
}