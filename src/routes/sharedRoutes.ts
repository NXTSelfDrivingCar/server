import { Application, Request, Response } from "express";
import { LogHandler } from "../logging/logHandler";
import { User } from "../user/userModel";
import { TicketComment } from "../tickets/commentModel";


import { UserController } from "../user/userController";
import { TicketController } from "../tickets/ticketController";
import { LogController } from "../logging/logController";
import { Authorization } from "../cookie/authorization";
import { Ticket } from "../tickets/ticketModel";
import path from "path";

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

    app.get("/user/debug", function (req, res) {
        // open html file
        res.sendFile(path.join(__dirname, "../views/client_page.html"));
      });

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

    app.get("/tickets/t/close/:id", logger.logRoute("closeTicket"), async (req: Request, res: Response) => {
        var ticket = await ticketController.getTicketById(req.params.id);
        var author = await Authorization.getUserFromCookie("auth", req);

        if(!author) return res.redirect("/login");
        if(!ticket) return res.redirect("/tickets");

        if(ticket.author.id !== author.id) return res.redirect("/tickets");

        await ticketController.updateTicket(ticket.id, {status: "Finished"});

        res.redirect("/tickets");
    })

    // ! =================== POST ROUTES =================== //
    

    app.post("/tickets/t/comment", logger.logRoute("addTicketComment"), async (req: Request, res: Response) => {
        var author = await Authorization.getUserFromCookie("auth", req);

        if (req.body.content < 1 || req.body.content > 2000) return res.redirect("/tickets/t/" + req.body.ticketId);
        if (!author) return res.redirect("/login");

        await ticketController.addCommentToTicket(req.body.ticketId, new TicketComment(author, req.body.content));

        res.redirect("/tickets/t/" + req.body.ticketId);
    })

    app.post("/tickets/t/add", logger.logRoute("assignTicket"), async (req: Request, res: Response) => {
        var author = await Authorization.getUserFromCookie("auth", req);

        if (!author) return res.redirect("/login");

        var newTicket = new Ticket(author, req.body.title, req.body.category, req.body.description, "Low", "Open");
        
        await ticketController.insertTicket(newTicket);

        res.redirect("/tickets");
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