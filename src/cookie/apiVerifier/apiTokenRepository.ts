import { LogHandler } from "../../logging/logHandler";
import { ApiToken } from "./apiTokenModel";
import { MongoRepository } from "../../config/mongoDB/mongoRepository";

const logger = new LogHandler();

export class ApiTokenRepository extends MongoRepository<ApiToken> {

    public async findTokenById(id: string): Promise<any> {
        return (await this._findApiTokensByFilter({ id: id }))[0];
    }

    public async findTokenByUserId(userId: string): Promise<any> {
        return (await this._findApiTokensByFilter({ userId: userId }))[0];
    }

    public async findTokenByRequiredFields(tokenId: string, userId: string, pageKey: string): Promise<any> {
        return (await this._findApiTokensByFilter({ id: tokenId, userId: userId, pageKey: pageKey }))[0];
    }

    public async insert(document: ApiToken): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "insert";
        this.logData.token = {
            id: document.id,
            userId: document.userId,
            pageKey: document.pageKey,
            expirationTime: document.expirationDate,
        };

        try {
            logger.info(this.logData);

            return await this._collection!!.insertOne(document);
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }
    findAll(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    public async delete(id: string): Promise<any> {
        if (!await this._isConnected()) return null;

        this.logData.method = "delete";
        this.logData.id = id;

        try {
            logger.info(this.logData);

            return await this._collection!!.deleteOne({ id: id });
        }
        catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
    }

    // ! =================== PRIVATE METHODS =================== //

    /**
     * 
     * @param filter Filter to use
     * @returns Users that match the filter or empty array if error
     */
    private async _findApiTokensByFilter(filter: any, limit: number = 0): Promise<Array<any>> {
        if(!await this._isConnected()) return [];

        this.logData.method = "_findApiTokenByFilter";
        this.logData.filter = filter;

        try {
            logger.info(this.logData);

            return await this._collection!!.find(filter as any).limit(limit).toArray();
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return [];
        }
    }

}