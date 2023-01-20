import { Application, Request, Response } from "express";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();
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

    app.get("/", logger.logRoute("getIndex"), (req: Request, res: Response) => {
        res.send("Main page")

        // render the index page
    });

    app.get("/tickets", logger.logRoute("viewTickets"), (req: Request, res: Response) => {
        res.send("Tickets page")

        // render the tickets page
    })

    app.get("/tickets/t", logger.logRoute("viewTicket"), (req: Request, res: Response) => {
        res.send("Specific ticket page")

        // render the specific ticket page
    })
    
    app.get("/login", logger.logRoute("login"), (req: Request, res: Response) => {
        res.send("Login page")

        // render the login page
    })

    app.get("/register", logger.logRoute("register"), (req: Request, res: Response) => {
        res.send("Register page")

        // render the register page
    })

    // ! =================== POST ROUTES =================== //

    app.post("/login", logger.logRoute("login") , (req: Request, res: Response) => {
        res.send("Login page")

        // render the login page if login failed
        // redirect to / if login success
    })

    app.post("/register", logger.logRoute("register"), (req: Request, res: Response) => {
        res.send("Register page")

        // render the register page if register failed
        // redirect to / if register success
    })

}