import { v4 } from 'uuid';
import { User } from '../user/userModel';

const uuid = v4();

export class Ticket {
    id: any;
    date: any;
    title: string;
    category: string;
    description: string;
    comments: any[]

    status: string = "Open";
    priority: string = "Low";

    author: {};

    constructor(author: User, title: string, category: string, description: string, priority: string = "Low", status: string = "Open", date = new Date(), id: any = uuid) {
        this.author = {
            id: author.id,
            username: author.username,
            role: author.role,
        }
        this.id = id;
        this.date = date;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.category = category;
        this.description = description;

        this.comments = [];
    }
}

