import { Application, Request, Response } from "express";

import { LogHandler } from "../logging/logHandler";
import { Authorization } from "../cookie/authorization";

import { ChangelogController } from "../changelog/changelogController";
import { UserController } from "../user/userController";

const logger = new LogHandler();

const changelogController = new ChangelogController();
const userController = new UserController();

module.exports = function(app: Application){
    app.get("/api/changelog", async (req: Request, res: Response) => {
        res.json(await changelogController.getChangelogs());
    })

    app.get("/api/admin/users", Authorization.authRole("admin"), async (req: Request, res: Response) => {
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        res.json(await userController.findUsersByFilter(req.query));
    })
}