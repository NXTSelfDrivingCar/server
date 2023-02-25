import { LogHandler } from "../logging/logHandler";
import { User } from "./userModel";
import { MongoRepository } from "../config/mongoDB/mongoRepository";

const logger = new LogHandler();

export class UserRepository extends MongoRepository<User> {

    // * =================== PUBLIC METHODS =================== //

    public async findAll(): Promise<any> {
        return await this._findUsersByFilter({});
    }
    
    
    public async findUserById(id: string): Promise<any> {
        return (await this._findUsersByFilter({ id: id }))[0];
    }


    public async findUserByUsername(username: string): Promise<any> {
        return (await this._findUsersByFilter({ username: username }))[0];
    }

    
    public async findUsersByEmail(email: string): Promise<any> {
        return await this._findUsersByFilter({ email: email} );
    }


    public async findUsersByRole(role: string): Promise<any> {
        var user = await this._findUsersByFilter({ role: role });
    }


    public async findUsersByFilter(filter: any): Promise<any> {
        return await this._findUsersByFilter(filter);
    }


    public async findUserByFilter(filter: any): Promise<any>{
        return (await this.findUsersByFilter(filter))[0];
    }


    public async insert(user: User): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "insert";
        this.logData.user = {
            id: user.id,
            username: user.username,
        };

        try {
            logger.info(this.logData);

            return await this._collection!!.insertOne(user);
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData);

            return null;
        }
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


    public async updateUser(id: string, updates: any): Promise<any> {
        if (!await this._isConnected()) return null;

        this.logData.method = "updateUser";
        this.logData.id = id;
        
        //TODO: Exclude password
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


    // ! =================== PRIVATE METHODS =================== //

    /**
     * 
     * @param filter Filter to use
     * @returns Users that match the filter or empty array if error
     */
    private async _findUsersByFilter(filter: any, limit: number = 0): Promise<Array<any>> {
        if(!await this._isConnected()) return [];

        this.logData.method = "_findUserByFilter";
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