import { v4 } from 'uuid';

const uuid = v4();

export class TicketComment{
    id: any;
    date: any;
    content: string = "";

    author: any;

    constructor(author: any, content: string, date = new Date(), id: any = uuid){
        this.author = {
            id: author.id,
            username: author.username,
            role: author.role,
        }
        this.id = id;
        this.date = date;
        this.content = content;
    }
}