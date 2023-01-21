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

    // ! =================== POST ROUTES =================== //
    
    app.post("/tickets/t/close", logger.logRoute("closeTicket"), (req: Request, res: Response) => {
        res.send("Close ticket")

        // Close ticket
        // Redirect to /tickets/t:id=ticket_id if success
    })

    app.post("/tickets/t/comment", logger.logRoute("addTicketComment"), (req: Request, res: Response) => {
        res.send("Comment ticket")

        // Comment ticket
        // Redirect to /tickets/t:id=ticket_id if success
    })

    // ! =================== IGNORE ROUTES =================== //
    // ! =================== IGNORE ROUTES =================== //
    // ! =================== IGNORE ROUTES =================== //

    app.get('/favicon.ico', (req, res) => res.status(204).end());
    
    app.get("*", logger.logRoute("get404"), (req: Request, res: Response) => {

        if (req.path === "/favicon.ico") return;

        res.send("404 page")
    })
}