import { Collection, Db, MongoClient } from "mongodb";
import { MongoConfig } from "./mongoConfig";
import { LogHandler } from "../../logging/logHandler"

const logger = new LogHandler();

export abstract class MongoRepository<T> {
    protected _collection: Collection | null = null;
    protected _client: MongoClient | null = null;
    protected _collectionName: string;
    protected _db: Db | null = null;

    protected logData: any = {}

    constructor(collectionName: string) {
        this._client = new MongoClient(MongoConfig.CONNECTION);
        this._collectionName = collectionName;

        this.logData = {
            origin: this.constructor.name,
            collection: this._collectionName,
        }
    }

    // * =================== PROTECTED METHODS =================== //

    async _isConnected(): Promise<boolean> {
        console.log(this.constructor.name + " is connecting to MongoDB...");

        try
        {
            await this._client!!.connect();
            this._db = this._client!!.db(MongoConfig.DATABASE);
            this._collection = this._db!!.collection(this._collectionName);
            
            return true
        }
        catch(err)
        {
            this.logData.method = "_isConnected";
            this.logData.error = err;
            logger.error(this.logData)

            return false;
        }
    }

    // ? =================== ABSTRACT METHODS =================== //

    abstract insert(document: T): Promise<any>;
    abstract findAll(): Promise<any>;
    abstract delete(id: string): Promise<any>;
}