const uuid = require("uuid");

// Status: open, closed, in progress
// Priority: low, medium, high

class Ticket {
  constructor(
    author,
    title,
    category,
    description,
    priority = "Low",
    status = "Open",
    date = new Date(),
    id = uuid.v4()
  ) {
    this.id = id;
    this.author = {
      id: author.id,
      username: author.username,
      role: author.role,
    };
    this.title = title;
    this.category = category;
    this.description = description;
    this.priority = priority;
    this.date = date;
    this.status = status;
    this.comments = [];
  }

  addComment(comment) {
    this.comments.push(comment);
  }
}

class Comment {
  constructor(author, role, text, date = new Date(), id = uuid.v4()) {
    this.author = author;
    this.role = role;
    this.text = text;
    this.date = date;
    this.id = id;
  }
}

module.exports = { Ticket, Comment };
