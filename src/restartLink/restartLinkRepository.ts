import { MongoRepository } from "../config/mongoDB/mongoRepository";
import { RestartLink } from "./restartLinkModel";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();

export class RestartLinkRepository extends MongoRepository<RestartLink>{

    public async insert(document: RestartLink): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "insert";
        this.logData.document = document;
        this.logData.user = {
            id: document.id,
        }

        try{
            logger.info(this.logData);

            return await this._collection!!.insertOne(document);
        } catch(err){
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }

    findAll(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    public async delete(id: string): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "delete";
        this.logData.linkId = id;

        try{
            logger.info(this.logData);

            return await this._collection?.deleteOne({ id: id });
        }
        catch(err){
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }

    }

    public async findLinkById(id: string): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "findLinkById";
        this.logData.linkId = id;

        try{
            logger.info(this.logData);

            return await this._collection?.findOne({ id: id });
        }
        catch(err){
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }

    public async findLinkByObjectId(_id: string): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "findLinkById";
        this.logData.linkId = _id;

        try{
            logger.info(this.logData);

            return await this._collection?.findOne({ _id: _id });
        }
        catch(err){
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }

}