const express = require("express");
app = express();

function send(req, resp) {
  resp.send("Express JS");
}
module.exports = app;

app.get("/", send);
app.listen(3000);
