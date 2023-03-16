import { Application, Request, Response } from "express";

import { LogHandler } from "../logging/logHandler";
import { Authorization } from "../cookie/authorization";

import { ChangelogController } from "../changelog/changelogController";
import { UserController } from "../user/userController";
import { RestartLinkController } from "../restartLink/restartLinkController";

import { EmailHandler } from "../emailHandler/emailHandler";
import { EmailMessage } from "../emailHandler/messageModel";


const logger = new LogHandler();

const changelogController = new ChangelogController();
const userController = new UserController();
const restartLinkController = new RestartLinkController();

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

    // ! =================== POST ROUTES =================== //

    app.post("/api/user/password/reset/", async (req: Request, res: Response) => {

        var to = req.body.email;

        restartLinkController.createRestartLink(req.body.username).then(async (data) => {
            if(data.acknowledged){
                var link = await restartLinkController.getRestartLinkByObjectId(data.insertedId);

                EmailHandler.sendEmail(new EmailMessage(to, "Password reset", "Click the link to reset your password: " + link.link));
            }
        });

        res.json({success: "Restart link created"});
    })
}