import { LogHandler } from "../logging/logHandler";
import { Changelog } from "./changelogModel";
import { MongoRepository } from "../config/mongoDB/mongoRepository";

const logger = new LogHandler();

export class ChangelogRepository extends MongoRepository<Changelog> {
    
    // * =================== PUBLIC METHODS =================== //

    /**
     * Inserts a changelog into the database
     * @param changelog Changelog to insert
     * @returns Inserted changelog or null if error
     */
    public async insert(changelog: Changelog): Promise<any> {
        if(!await this._isConnected()) return null;

        try {
            return await this._collection!!.insertOne(changelog);
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async findAll(): Promise<any> {
        return await this.findLatest();
    }

    public async findChangelogsByDate(date: Date): Promise<any> {
        return await this._findChangelogsByFilter({ date: date });
    }

    public async findChangelogsByVersion(version: string): Promise<any> {
        return await this._findChangelogsByFilter({ version: version });
    }

    public async delete(id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }


    /**
     * Finds the latest changelogs
     * @param limit 0 = no limit
     * @returns Changelogs in descending order by date (latest first) or empty array if error
     */
    public async findLatest(limit = 0): Promise<Array<any>> {
        if(!await this._isConnected()) return [];

        try {
            return await this._collection!!.find().sort({ date: -1 }).limit(limit).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    // ! =================== PRIVATE METHODS =================== //

    /**
     * 
     * @param filter Filter to use
     * @returns Changelogs that match the filter or empty array if error
     */
    private async _findChangelogsByFilter(filter: any ): Promise<Array<any>> {
        if(!await this._isConnected()) return [];

        try {
            return await this._collection!!.find(filter as any).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}