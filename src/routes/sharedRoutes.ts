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

    app.get("*", logger.logRoute("get404"), (req: Request, res: Response) => {
        res.send("404 page")

        // render the 404 page
    })

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
}