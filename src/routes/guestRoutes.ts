import { Application, Request, Response } from "express";
import { LogHandler } from "../logging/logHandler";

import { ChangelogController } from "../changelog/changelogController";
import { Changelog } from "../changelog/changelogModel";
import { Authorization } from "../cookie/authorization";
import { UserController } from "../user/userController";
import { TicketController } from "../tickets/ticketController";
import { User } from "../user/userModel";

const logger = new LogHandler();
const changelogController = new ChangelogController();
const userController = new UserController();
const ticketController = new TicketController();

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

    app.get("/", logger.logRoute("getIndex"), async (req: Request, res: Response) => {
        // res.send("Main page")
        res.render("main_page_index.ejs", {
            title: "Main page",
            changelog: await changelogController.getChangelogs(),
            user: await Authorization.getUserFromCookie("auth", req)
        })
        // render the index page
    });

    app.get("/tickets", logger.logRoute("viewTickets"), async (req: Request, res: Response) => {
        for(var key in req.query) {
            if(req.query[key] === "") delete req.query[key]
        }

        res.render("tickets.ejs", {
            title: "Tickets page",
            user: Authorization.getUserFromCookie("auth", req),
            tickets: await ticketController.getTicketsByFilter(req.query),
        })
    })

    // Ovo se poziva localhost:5000/tickets/t/1 ; localhost:5000/tickets/t/2
    app.get("/tickets/t/:id", logger.logRoute("viewTicket"), (req: Request, res: Response) => {
        res.send("Specific ticket page")

        // render the specific ticket page
    })
    
    app.get("/login", logger.logRoute("login"), async (req: Request, res: Response) => {
        res.render("login_page.ejs", {
            title: "Login page",
            user: await Authorization.getUserFromCookie("auth", req),
            status: ""
        })
    })

    app.get("/register", logger.logRoute("register"), async (req: Request, res: Response) => {
        res.render("register_page.ejs", {
            title: "Register page",
            user: await Authorization.getUserFromCookie("auth", req),
            status: ""
        })
    })

    // ! =================== POST ROUTES =================== //

    app.post("/login", logger.logRoute("login") , async (req: Request, res: Response) => {
        var username = req.body.username;
        var password = req.body.password;

        var result = await userController.login(username,password, req, res)

        if(result.status == "loginComplete"){
            res.redirect("/")
        }

        if(result.status == "loginFailed"){
            res.render("login_page.ejs", {
                title: "Login page",
                user: Authorization.getUserFromCookie("auth", req),
                status: "loginFailed"
            })
        }
    })

    app.post("/register", logger.logRoute("register"), async (req: Request, res: Response) => {
        var user = new User(req.body.username, req.body.password, req.body.email, "user", "apitoken")
        var result = await userController.register(user)

        if(result.status == "registrationComplete"){
            // TODO: Add email verification
            res.redirect("/login")
        }

        res.render("register_page.ejs", {
            title: "Register page",
            user: await Authorization.getUserFromCookie("auth", req),
            status: result.status
        })
    })

}