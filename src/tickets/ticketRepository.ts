import { Ticket } from "./ticketModel";
import { MongoRepository } from "../config/mongoDB/mongoRepository";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();

export class TicketRepository extends MongoRepository<Ticket> {


    async findAll(): Promise<any> {
        return await this._findDocumentsByFilter({});
    }

    async findTicketById(id: string): Promise<any> {
        return (await this._findDocumentsByFilter({ id: id }))[0];
    }

    async findTicketsByFilter(filter: any): Promise<any> {
        return await this._findDocumentsByFilter(filter);
    }

    async findTicketByFilter(filter: any): Promise<any> {
        return (await this._findDocumentsByFilter(filter))[0];
    }

    async findTicketsByUserId(userId: string): Promise<any> {
        return await this._findDocumentsByFilter({ "author.id": userId });
    }


    async delete(id: string): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "delete";
        this.logData.id = id;

        try {
            logger.info(this.logData);

            return await this._collection!!.deleteOne({ id: id });
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }


    async insert(document: Ticket): Promise<any> {
        if (!await this._isConnected()) return null;

        this.logData.method = "insert";
        this.logData.document = document;

        try {
            logger.info(this.logData);

            return await this._collection!!.insertOne(document);
        }
        catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }


    async updateTicket(id: string, updates: any): Promise<any> {
        if (!await this._isConnected()) return null;

        this.logData.method = "updateTicket";
        this.logData.id = id;
        
        this.logData.updates = updates; 

        try {
            logger.info(this.logData);

            return await this._collection!!.updateOne({ id: id }, { $set: updates });
        }
        catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }


    async addComment(id: string, comment: any): Promise<any> {
        if (!await this._isConnected()) return null;

        this.logData.method = "addComment";
        this.logData.id = id;
        this.logData.comment = comment;

        try {
            logger.info(this.logData);

            return await this._collection!!.updateOne({ id: id }, { $push: { comments: comment } });
        }
        catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }
}

