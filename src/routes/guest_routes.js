const path = require("path");

module.exports = function (server) {
  server.get("/user/debug", function (req, res) {
    // open html file
    res.sendFile(path.join(__dirname, "../views/client_page.html"));
  });
};
