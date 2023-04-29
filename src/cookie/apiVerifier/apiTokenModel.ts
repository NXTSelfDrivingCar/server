import { Timestamp } from 'mongodb';
import {v4} from 'uuid';

const uuId = v4();

export class ApiToken {
    id: any;
    userId: string;
    expirationDate: Date;
    pageKey: string;

    constructor( userId: string, expirationDate: Date, pageKey: string, id: any = ApiToken._generateId()) {
        this.id = id;
        this.userId = userId;
        this.expirationDate = expirationDate;
        this.pageKey = pageKey;
    }

    private static _generateId(): string {
        return Date.now().toString() + Math.random().toString();
    }
}