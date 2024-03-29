import { Application, Request, Response } from "express"
import { LogHandler } from "../logging/logHandler"
import { Authorization } from "../cookie/authorization"

const logger = new LogHandler()

import { UserController } from "../user/userController"
import { LogController } from "../logging/logController"
import { TicketController } from "../tickets/ticketController"
import { ChangelogController } from "../changelog/changelogController"
import { Changelog } from "../changelog/changelogModel"
import { User } from "../user/userModel"

const userController = new UserController()
const logController = new LogController()
const ticketController = new TicketController()
const changelogController = new ChangelogController()

/*
*
*==========================================================================
*==========================================================================
*============================= MODULE EXPORTS =============================
*==========================================================================
*==========================================================================
*
 */

module.exports = function(app: Application) {

    // ! =================== GET ROUTES =================== //

    app.get("/admin/dashboard", logger.logRoute("getDashboard"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        // Open the dashboard page

        res.render("admin_dashboard_index.ejs", {
            title: "Admin dashboard",
        })
    })

    app.get("/admin/users/list", logger.logRoute("listUsers"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        
        await Authorization.generateApiToken(false, req, res);
        
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        res.render("admin_list_users.ejs", {
            title: "Admin users list",
            users: await userController.findUsersByFilter(req.query),
            adminUser: await Authorization.getUserFromCookie("auth", req),
            status: ""
        })
    })

    app.get("/admin/user/update/:id", logger.logRoute("updateUser"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        res.render("admin_user_update.ejs", {
            title: "Admin user update",
            user: await userController.findUserById(req.params.id),
        })
    })

    app.get("/admin/logs", logger.logRoute("viewLogs"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        res.render("admin_logs.ejs", {
            title: "Admin logs",
            logs: logController.getAll(),
        })

        // render the logs page by empty filter if query is empty
    })

    app.get("/admin/logs/l/:name",  logger.logRoute("viewLog"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        
        await Authorization.generateApiToken(false, req, res);
        
        res.render("admin_log_view.ejs", {
            title: "Admin log view",
            thisLogName: req.params.name,
            activeLogName: logController.getCurrentLogName(),
        })
    })

    app.get("/admin/changelog/add", logger.logRoute("addChangelog"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        res.render("admin_changelog.ejs", {
            title: "Admin changelog",
            user: await Authorization.getUserFromCookie("auth", req),
            latestChangelog: (await changelogController.getLatestChangelogs(1))[0],
        })
    })

    app.get("/admin/user/delete/:id", logger.logRoute("deleteUser"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        await userController.deleteUser(req.params.id)

        res.redirect("/admin/users/list")
    })

    app.get("/admin/users/live", logger.logRoute("liveUsers"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        res.render("admin_users_live.ejs", {
            title: "Admin live users",
        })
    })

    // ! =================== POST ROUTES =================== //

    app.post("/admin/log/delete/:name", logger.logRoute("deleteLog"), Authorization.authRole("admin"), Authorization.authUser(), async (req: Request, res: Response) => {
        var currentLog = logController.getCurrentLogName()

        if(currentLog === req.params.name) { 
            // If the log is the current log, redirect to the logs page
            return res.redirect("/")
        }
        
        await logController.deleteLogByName(req.params.name)

        res.redirect("/admin/logs")
    })

    app.post("/admin/changelog/add", logger.logRoute("addChangelog"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        var isBeta = req.body.isBeta === "on" ? true : false
        
        var changelog = new Changelog(req.body.title, req.body.version, isBeta, req.body.description);

        await changelogController.createChangelog(changelog)

        res.redirect("/")
    })

    app.post("/admin/user/update", logger.logRoute("updateUser"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        var result = await userController.updateUser(req.body.id, req.body)
        
        res.redirect("/admin/users/list")
    })

    app.post("/admin/tickets/t/update", logger.logRoute("updateTicket"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        for(var key in req.body) {
            if(req.body[key] === "") delete req.body[key]
        }

        await ticketController.updateTicket(req.body.ticketId, req.body)

        res.redirect("/tickets/t/" + req.body.ticketId)
    })

    app.post("/admin/user/create", logger.logRoute("createUser"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        var result = await userController.register(new User(req.body.username, req.body.password, req.body.email, req.body.role, "api"))

        if(!result) { res.redirect("/admin/users/list") } 

        if(result.status == 'registrationComplete') {
            res.redirect("/admin/users/list")
            return;
        }

        res.render("admin_list_users.ejs", {
            title: "Admin users list",
            users: await userController.findUsersByFilter(req.query),
            adminUser: await Authorization.getUserFromCookie("auth", req),
            status: result.status
        })
    })
    
}