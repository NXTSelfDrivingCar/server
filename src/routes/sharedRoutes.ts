import { Application, Request, Response } from "express";
import { LogHandler } from "../logging/logHandler";
import { User } from "../user/userModel";


import { UserController } from "../user/userController";
import { TicketController } from "../tickets/ticketController";
import { LogController } from "../logging/logController";
import { Authorization } from "../cookie/authorization";

const logger = new LogHandler();

const userController = new UserController();
const ticketController = new TicketController();
const logController = new LogController();

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

    app.get("/signToken/debug", logger.logRoute("debugLogin"), async (req: Request, res: Response) => {
        var token = Authorization.signToken("e3f84020-b3f3-4f7c-8b4a-ceb38b98e167", res, req);
        var user = await Authorization.getUserFromCookie("auth", req);
        
        res.send(user);
    })

    app.get("/user/logByLevel/debug", logger.logRoute("debugLogin"), async (req: Request, res: Response) => {
        var logs = await logController.getLogByName("log_1676122663840");
        
        console.log(logs);

        logs = await logController.getLogValueByLevel("log_1676122663840", "INFO");

        console.log(logs);

        logs = await logController.getLogValueByFilter("log_1676122663840", {method: "GET"});

        console.log(logs);
    })

    app.get("/user/ticketGet/debug", logger.logRoute("debugTicketGet"), async (req: Request, res: Response) => {
        var ticket = await ticketController.getTicketById("45a7a34b-1026-459a-8620-774d10921c15");
        var ticketByUser = await ticketController.getTicketsByUserId("48d5f9f6-c1e9-4f99-ad7c-0fd0c8df9cae");
        console.log(ticketByUser);
    })

    // app.get("/user/login/debug", logger.logRoute("debugLogin"), async (req: Request, res: Response) => {
    //     var user = await userController.login("AnTas", "1234");

    //     console.log(user);
    // })

    app.get("/user/register/debug", logger.logRoute("debugRegister"), async (req: Request, res: Response) => {
        var user = await userController.register(new User("AnTas", "1234", "akitasevski112@gmail.com", "admin" ,"apikey"));

        console.log(user);
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

    // ! =================== IGNORE ROUTES =================== //
    // ! =================== IGNORE ROUTES =================== //
    // ! =================== IGNORE ROUTES =================== //

    app.get('/favicon.ico', (req, res) => res.status(204).end());
    
    app.get("*", logger.logRoute("get404"), (req: Request, res: Response) => {

        if (req.path === "/favicon.ico") return;

        res.send("404 page")
    })
}