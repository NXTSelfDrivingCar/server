import { Application, Request, Response } from "express"

module.exports = function(app: Application) {

    // ! =================== GET ROUTES =================== //

    app.get("/admin/dashboard", (req: Request, res: Response) => {
        res.send("Admin dashboard")

        // render the dashboard page
    })

    app.get("/admin/users/list", (req: Request, res: Response) => {
        res.send("Admin users list")

        // render the users list page by empty filter if query is empty
    })

    app.get("/admin/user/update", (req: Request, res: Response) => {
        res.send("Admin users update")

        // render the update user page
    })

    app.get("/admin/logs", (req: Request, res: Response) => {
        res.send("Admin logs")

        // render the logs page by empty filter if query is empty
    })

    app.get("/admin/logs/l", (req: Request, res: Response) => {
        res.send("Admin specific log")

        // render the specific log page
    })

    app.get("/admin/changelog/add", (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // render the add changelog page
    })

    // ! =================== POST ROUTES =================== //

    app.post("/admin/changelog/add", (req: Request, res: Response) => {
        res.send("Admin changelog add")

        // Add changelog
        // Redirect to /admin/changelog/add
    })

    app.post("/admin/user/update", (req: Request, res: Response) => {
        res.send("Admin users update")

        // Update user
        // Redirect to /admin/users/list
    })

    app.post("/admin/tickets/t/update", (req: Request, res: Response) => {
        res.send("Admin tickets update")

        // Update ticket
        // Redirect to /admin/tickets/t:id=ticket_id
    })

    // ! =================== DELETE ROUTES =================== //

    app.delete("/admin/user/delete", (req: Request, res: Response) => {
        res.send("Admin users delete")

        // Delete user by id
        // Redirect to /admin/users/list
    })

    app.delete("/admin/log/delete", (req: Request, res: Response) => {
        res.send("Admin logs delete")

        // Delete log by id
        // Redirect to /admin/logs
    })
}