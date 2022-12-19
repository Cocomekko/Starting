const express = require("express");
const addDays = require("date-fns/addDays");
const app = express(); 
module.exports = app;   //exporting the instance of express
app.get("/", (req, resp) => {
  const newDate = addDays(new Date(), 100);
  resp.send(`${newDate.getDate()}/${newDate.getMonth()+1}/${newDate.getFullYear()}`);
});
app.listen(3000);
