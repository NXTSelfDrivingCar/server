// require uuid to generate unique id
const uuid = require("uuid");

class User {
  constructor(username, password, email, nxt_api_key, role, id = uuid.v4()) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.nxt_api_key = nxt_api_key;
    this.role = role;
  }
}

module.exports = User;

// TODO: Dodati da korisnik ima poslednje vreme logovanja, posledenje vreme zahtevanja HTTP zahteva,... (za statistiku)
