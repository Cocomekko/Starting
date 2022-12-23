const express = require("express");
const app = express();
module.exports = app;

app.get("/", (req, resp) => {
  resp.send("Home Page");
});
app.get("/about", (req, resp) => {
  resp.send("About Page");
});
app.listen(3000);
