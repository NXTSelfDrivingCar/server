import { TicketRepository } from "./ticketRepository";
import { Ticket } from "./ticketModel";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();
const TICKETS_COLLECTION = "userTickets";

export class TicketController {
    private _ticketRepository: TicketRepository;

    constructor() {
        this._ticketRepository = new TicketRepository(TICKETS_COLLECTION);
    }

    async getAllTickets(): Promise<any> {
        return await this._ticketRepository.findAll();
    }

    async getTicketById(id: string): Promise<any> {
        return await this._ticketRepository.findTicketById(id);
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

    async updateTicket(id: string, document: Ticket): Promise<any> {
        return await this._ticketRepository.updateTicket(id, document);
    }

    async addCommentToTicket(id: string, comment: Comment): Promise<any> {
        return await this._ticketRepository.addComment(id, comment);
    }
}