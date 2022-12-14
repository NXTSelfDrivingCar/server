// require uuid to generate unique id
const uuid = require("uuid");

class User {
  constructor(username, password, email, nxt_api_key, role) {
    this.id = uuid.v4();
    this.username = username;
    this.password = password;
    this.email = email;
    this.nxt_api_key = nxt_api_key;
    this.roel = role;
  }
}

module.exports = User;
