import { TicketRepository } from "./ticketRepository";
import { Ticket } from "./ticketModel";
import { LogHandler } from "../logging/logHandler";
import { TicketComment } from "./commentModel";
import { UserController } from "../user/userController";

const logger = new LogHandler();
const TICKETS_COLLECTION = "userTickets";
const userController = new UserController();

export class TicketController {
    private _ticketRepository: TicketRepository;

    constructor() {
        this._ticketRepository = new TicketRepository(TICKETS_COLLECTION);
    }

    async getAllTickets(): Promise<any> {
        return await this._ticketRepository.findAll();
    }

    async getTicketsByFilter(filter: any): Promise<any> {
        return await this._ticketRepository.findTicketsByFilter(filter);
    }

    async getTicketByFilter(filter: any): Promise<any> {
        return await this._ticketRepository.findTicketByFilter(filter);
    }

    async getTicketsByUserId(userId: string): Promise<any> {
        return await this._ticketRepository.findTicketsByUserId(userId);
    }

    async deleteTicket(id: string): Promise<any> {
        return await this._ticketRepository.delete(id);
    }

    async insertTicket(document: Ticket): Promise<any> {
        return await this._ticketRepository.insert(document);
    }

    async updateTicket(id: string, document: any): Promise<any> {
        return await this._ticketRepository.updateTicket(id, document);
    }

    async addCommentToTicket(id: string, comment: TicketComment): Promise<any> {
        return await this._ticketRepository.addComment(id, comment);
    }

    async getTicketById(id: string): Promise<any> {
        var ticket = await this._ticketRepository.findTicketById(id);

        if(!ticket) return null;
        
        try{
            for (var comment of ticket.comments) {
                var commentAuthor = await userController.findUserById(comment.author.id);
    
                if(!commentAuthor) continue;
    
                comment.author = {
                    username: commentAuthor.username,
                    role: commentAuthor.role,
                }
            }
        }catch(err){
            logger.error(err);
            return null;
        }

        this.updateTicket(id, ticket);

        return ticket;
    }

}