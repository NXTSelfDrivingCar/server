import uuid from 'uuid';

export class User {
    id: any;
    role: string;
    name: string;
    email: string;
    password: string;
    apiToken: string;

    constructor(id: any = uuid.v4, role: string, name: string, email: string, password: string, apiToken: string) {
        this.id = id;
        this.role = role;
        this.name = name;
        this.email = email;
        this.password = password;
        this.apiToken = apiToken;
    }
}