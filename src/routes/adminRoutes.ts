import { Application, Request, Response } from "express"
import { LogHandler } from "../logging/logHandler"
import { Authorization } from "../cookie/authorization"

const logger = new LogHandler()

import { UserController } from "../user/userController"
import { LogController } from "../logging/logController"
import { TicketController } from "../tickets/ticketController"

const userController = new UserController()
const logController = new LogController()
const ticketController = new TicketController()

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

    app.get("/admin/changelog/add", logger.logRoute("addChangelog"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // render the add changelog page
    })

    app.get("/admin/user/delete/:id", logger.logRoute("deleteUser"), Authorization.authRole("admin"), async (req: Request, res: Response) => {
        await userController.adminDeleteUser(req.params.id)

        res.redirect("/admin/users/list")
    })

    // ! =================== POST ROUTES =================== //

    app.post("/admin/changelog/add", logger.logRoute("addChangelog"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // Add changelog
        // Redirect to /admin/changelog/add
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

    // ! =================== DELETE ROUTES =================== //



    app.delete("/admin/log/delete", logger.logRoute("deleteLog"), Authorization.authRole("admin"), (req: Request, res: Response) => {
        res.send("Admin logs delete")

        // Delete log by id
        // Redirect to /admin/logs
    })
}