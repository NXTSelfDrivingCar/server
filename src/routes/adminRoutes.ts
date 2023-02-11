import { Application, Request, Response } from "express"
import { LogHandler } from "../logging/logHandler"
import { Authorization } from "../cookie/authorization"

const logger = new LogHandler()

import { UserController } from "../user/userController"
import { LogController } from "../logging/logController"
import { TicketController } from "../tickets/ticketController"
import { ChangelogController } from "../changelog/changelogController"
import { Changelog } from "../changelog/changelogModel"

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
        res.render("admin_dashboard_index.ejs", {
            title: "Admin dashboard",
        })
    })

    app.get("/admin/users/list", logger.logRoute("listUsers"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        res.render("admin_list_users.ejs", {
            title: "Admin users list",
            users: await userController.findUsersByFilter(req.query),
            adminUser: await Authorization.getUserFromCookie("auth", req),
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
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }
        
        res.render("admin_log_view.ejs", {
            title: "Admin log view",
            log: await logController.getLogValueByFilter(req.params.name, req.query),
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
        await userController.adminDeleteUser(req.params.id)

        res.redirect("/admin/users/list")
    })

    app.get("/admin/log/delete/:name", logger.logRoute("deleteLog"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        console.log(req.params.name);
        
        await logController.deleteLogByName(req.params.name)

        res.redirect("/admin/logs")
    })

    // ! =================== POST ROUTES =================== //

    app.post("/admin/changelog/add", logger.logRoute("addChangelog"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        var isBeta = req.body.isBeta === "on" ? true : false
        
        var changelog = new Changelog(req.body.title, req.body.version, isBeta, req.body.description);

        await changelogController.createChangelog(changelog)

        res.redirect("/")
    })

    app.post("/admin/user/update", logger.logRoute("updateUser"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        var result = userController.adminUpdateUser(req.body.id, req.body)
        
        res.redirect("/admin/users/list")
    })

    app.post("/admin/tickets/t/update", logger.logRoute("updateTicket"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        for(var key in req.body) {
            if(req.body[key] === "") delete req.body[key]
        }

        await ticketController.updateTicket(req.body.ticketId, req.body)

        res.redirect("/tickets/t/" + req.body.ticketId)
    })
    
}