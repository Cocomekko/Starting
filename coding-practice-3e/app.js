const express = require("express");
const app = express();
module.exports = app;

app.get("/", (req, resp) => {
  const date = new Date();
  resp.send(`${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`);
});
app.listen(3000);
