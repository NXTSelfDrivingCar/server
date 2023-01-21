import { Collection, Db, MongoClient } from "mongodb";
import { MongoConfig } from "./mongoConfig";

export abstract class MongoRepository<T> {
    protected _client: MongoClient | null = null;
    protected _db: Db | null = null;
    protected _collection: Collection | null = null;
    protected _collectionName: string;

    constructor(collectionName: string) {
        this._client = new MongoClient(MongoConfig.CONNECTION);
        this._collectionName = collectionName;
    }

    // * =================== PROTECTED METHODS =================== //

    async _isConnected(): Promise<boolean> {
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

    // ? =================== ABSTRACT METHODS =================== //

    abstract insert(document: T): Promise<any>;
    abstract findAll(): Promise<any>;
    abstract delete(id: string): Promise<any>;
}