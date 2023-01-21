import uuid from "uuid"

export class Ticket {
    id: any;
    date: any;
    title: string;
    category: string;
    description: string;
    comments: any[]

    status: string = "Open";
    priority: string = "Low";

    constructor(title: string, category: string, description: string, priority: string = "Low", status: string = "Open", date = new Date(), id: any = uuid.v4) {
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