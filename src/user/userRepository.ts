import { MongoConfig } from "../config/mongoDB/mongoConfig";
import { LogHandler } from "../logging/logHandler";
import { MongoClient } from "mongodb";
import { User } from "./userModel";
import { MongoRepository } from "../config/mongoDB/mongoRepository";

const logger = new LogHandler();

export class UserRepository extends MongoRepository<User> {

    public async insert(user: User): Promise<any> {
        if(!await this._isConnected()) return null;

        try {
            return await this._collection!!.insertOne(user);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async findAll(): Promise<any> {
        if (!await this._isConnected()) return null;

        try {
            return await this._collection!!.find().toArray();
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }

    public async delete(id: string): Promise<any> {
        if (!await this._isConnected()) return null;

        try {
            return await this._collection!!.deleteOne({ id: id });
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }

    public async updateUser(id: string, updates: any): Promise<any> {
        if (!await this._isConnected()) return null;

        try {
            return await this._collection!!.updateOne({ id: id }, { $set: updates });
        }
        catch (err) {
            return null;
        }
    }
    
    public async findUserById(id: string): Promise<any> {
        var user = await this._findUserByFilter({ id: id });

        return JSON.stringify(user) !== "[]" ? user : null;
    }

    public async findUserByUsername(username: string): Promise<any> {
        var user = await this._findUserByFilter({ username: username });

        return JSON.stringify(user) !== "[]" ? user : null;
    }
    
    public async findUsersByEmail(email: string): Promise<any> {
        return await this._findUserByFilter({ email: email} );
    }

    public async findUsersByRole(role: string): Promise<any> {
        var user = await this._findUserByFilter({ role: role });
    }

    public async findUsersByFilter(filter: any): Promise<any> {
        return await this._findUserByFilter(filter);
    }
    

    // ! =================== PRIVATE METHODS =================== //

    /**
     * 
     * @param filter Filter to use
     * @returns Users that match the filter or empty array if error
     */
    private async _findUserByFilter(filter: any, limit: number = 0): Promise<Array<any>> {
        if(!await this._isConnected()) return [];

        try {
            return await this._collection!!.find(filter as any).limit(limit).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}