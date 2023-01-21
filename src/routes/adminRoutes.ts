import { Application, Request, Response } from "express"
import { LoggerLevel } from "mongodb"
import { LogHandler } from "../logging/logHandler"

const logger = new LogHandler()

import { UserController } from "../user/userController"

const userController = new UserController()

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

    app.get("/admin/dashboard", logger.logRoute("getDashboard"), (req: Request, res: Response) => {
        res.send("Admin dashboard")

        // render the dashboard page
    })

    app.get("/admin/users/list", logger.logRoute("listUsers"), async (req: Request, res: Response) => {
        // res.send("Admin users list")
        
        // ! TESTCODE

        // TODO: Remove this test code
        res.render("admin_list_users.ejs", {
            title: "Admin users list",
            users: await userController.findUsersByFilter({role: "user"})
        })

        // ! END TESTCODE

        // TODO: render the users list page by empty filter if query is empty
    })

    app.get("/admin/user/update", logger.logRoute("updateUser"), (req: Request, res: Response) => {
        res.send("Admin users update")

        // render the update user page
    })

    app.get("/admin/logs", logger.logRoute("viewLogs"), (req: Request, res: Response) => {
        res.send("Admin logs")

        // render the logs page by empty filter if query is empty
    })

    app.get("/admin/logs/l/:name",  logger.logRoute("viewLog"), (req: Request, res: Response) => {
        res.send("Admin specific log")

        // render the specific log page
    })

    app.get("/admin/changelog/add", logger.logRoute("addChangelog"), (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // render the add changelog page
    })

    // ! =================== POST ROUTES =================== //

    app.post("/admin/changelog/add", logger.logRoute("addChangelog"), (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // Add changelog
        // Redirect to /admin/changelog/add
    })

    app.post("/admin/user/update", logger.logRoute("updateUser"), (req: Request, res: Response) => {
        res.send("Admin users update")

        // Update user
        // Redirect to /admin/users/list
    })

    app.post("/admin/tickets/t/update", logger.logRoute("updateTicket"), (req: Request, res: Response) => {
        res.send("Admin tickets update")

        // Update ticket
        // Redirect to /admin/tickets/t:id=ticket_id
    })

    // ! =================== DELETE ROUTES =================== //

    app.delete("/admin/user/delete", logger.logRoute("deleteUser"), (req: Request, res: Response) => {
        res.send("Admin users delete")

        // Delete user by id
        // Redirect to /admin/users/list
    })

    app.delete("/admin/log/delete", logger.logRoute("deleteLog"), (req: Request, res: Response) => {
        res.send("Admin logs delete")

        // Delete log by id
        // Redirect to /admin/logs
    })
}