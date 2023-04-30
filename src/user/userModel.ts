import {v4} from 'uuid';

const uuId = v4();

export class User {
    id: any;
    role: string;
    email: string;
    username: string;
    password: string;
    apiToken: string;

    constructor( username: string, password: string, email: string, role: string, apiToken: string, id: any = uuId) {
        this.id = id;
        this.role = role;
        this.username = username;
        this.email = email;
        this.password = password;
        this.apiToken = apiToken;
    }
}