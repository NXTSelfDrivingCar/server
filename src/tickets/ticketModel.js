const uuid = require("uuid");

class Ticket {
  constructor(
    author,
    title,
    category,
    description,
    priority,
    status,
    date = new Date(),
    id = uuid.v4(),
    reply = {}
  ) {
    this.author = author;
    this.title = title;
    this.category = category;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.date = date;
    this.id = id;
    this.reply = reply;
  }
}
