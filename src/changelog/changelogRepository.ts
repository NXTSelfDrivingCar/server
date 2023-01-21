import { Collection, Db, MongoClient } from "mongodb";
import { LogHandler } from "../logging/logHandler";
import { Changelog } from "./changelogModel";
import { MongoConfig } from "../config/mongoConfig";

const logger = new LogHandler();

export class ChangelogRepository {
    private _client: MongoClient | null = null;
    private _db: Db | null = null;
    private _collection: Collection | null = null;
    private _collectionName: string;
    
    constructor(collectionName: string) {
        this._client = new MongoClient(MongoConfig.CONNECTION);
        this._collectionName = collectionName;
    }

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

    /**
     * Checks if the client is connected to the database asynchroniously
     * @returns True if connected, false if error
     */
    private async _isConnected(): Promise<boolean> {  
        try
        {
            await this._client!!.connect();
            this._db = this._client!!.db(MongoConfig.DATABASE);
            this._collection = this._db!!.collection(this._collectionName);
            return true
        }
        catch(err)
        {
            console.log(err);
            return false;
        }
    }
}