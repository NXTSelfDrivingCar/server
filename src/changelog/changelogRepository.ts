import { LogHandler } from "../logging/logHandler";
import { Changelog } from "./changelogModel";
import { MongoRepository } from "../config/mongoDB/mongoRepository";

const logger = new LogHandler();

export class ChangelogRepository extends MongoRepository<Changelog> {
    
    // * =================== PUBLIC METHODS =================== //

    public async findAll(): Promise<any> {
        return await this.findLatest();
    }

    public async findChangelogsByDate(date: Date): Promise<any> {
        return await this._findDocumentsByFilter({ date: date });
    }

    public async findChangelogsByVersion(version: string): Promise<any> {
        return await this._findDocumentsByFilter({ version: version });
    }

    /**
     * 
     * @param id Id of the changelog to delete
     * @returns Deleted changelog or null if error
     * @throws Error Method not implemented
     */
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

        this.logData.method = "findLatest";
        this.logData.limit = limit;

        try {
            logger.info(this.logData)

            return await this._collection!!.find().sort({ date: -1 }).limit(limit).toArray();
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData)

            return [];
        }
    }

    /**
     * Inserts a changelog into the database
     * @param changelog Changelog to insert
     * @returns Inserted changelog or null if error
     */
    public async insert(changelog: Changelog): Promise<any> {
        if(!await this._isConnected()) return null;

        this.logData.method = "insert";
        this.logData.changelog = changelog.version;

        try {
            logger.info(this.logData)

            return await this._collection!!.insertOne(changelog);
        } catch (err) {
            this.logData.error = err;
            logger.error(this.logData)

            return null;
        }
    }
}