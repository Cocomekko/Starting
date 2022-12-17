const addDate = require("date-fns/addDays");

function tellDate(days) {
  let newDate = addDate(new Date(2020, 7, 22), days);
  return `${newDate.getDate()}-${
    newDate.getMonth() + 1
  }-${newDate.getFullYear()}`;
}

module.exports = tellDate;
