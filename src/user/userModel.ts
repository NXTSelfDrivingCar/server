import uuid from 'uuid';

export class User {
    id: any;
    role: string;
    email: string;
    username: string;
    password: string;
    apiToken: string;

    constructor(id: any = uuid.v4, role: string, username: string, email: string, password: string, apiToken: string) {
        this.id = id;
        this.role = role;
        this.username = username;
        this.email = email;
        this.password = password;
        this.apiToken = apiToken;
    }
}