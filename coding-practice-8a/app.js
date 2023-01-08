const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
module.exports = app;

let database;
async function connectDatabase_and_listen() {
  try {
    const dbPath = path.join(__dirname, "todoApplication.db");
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
connectDatabase_and_listen();

app.get("/todos", async (req, resp) => {
  let result;
  let getTodos;
  if (Object.keys(req.query).length == 1) {
    const key = Object.keys(req.query)[0];
    if (key == "search_q") {
      getTodos = `select * from todo where todo like "%${req.query[key]}%";`;
    } else {
      getTodos = `select * from todo where ${key}="${req.query[key]}";`;
    }

    result = await database.all(getTodos);
  } else if (Object.keys(req.query).length == 2) {
    const key1 = Object.keys(req.query)[0];
    const key2 = Object.keys(req.query)[1];
    const getTodos = `select * from todo where ${key1}="${req.query[key1]}" and
                      ${key2}="${req.query[key2]}";`;
    result = await database.all(getTodos);
  }
  resp.send(result);
});

app.get("/todos/:todoId/", async (req, resp) => {
  const { todoId } = req.params;
  const getTodo = `select * from todo where id=${todoId};`;
  result = await database.get(getTodo);
  resp.send(result);
});

app.post("/todos", async (req, resp) => {
  const { id, todo, priority, status } = req.body;
  const createTodo = `insert into todo (id, todo, priority, status)
                        values (${id}, "${todo}", "${priority}", "${status}");`;
  await database.run(createTodo);
  resp.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (req, resp) => {
  const { todoId } = req.params;
  let key = Object.keys(req.body)[0];
  const updateTodo = `update todo set ${key}='${req.body[key]}' where
                        id=${todoId};`;
  await database.run(updateTodo);
  key = key[0].toUpperCase() + key.slice(1);
  resp.send(`${key} Updated`);
});

app.delete("/todos/:todoId", async (req, resp) => {
  const { todoId } = req.params;
  const deleteTodo = `delete from todo where id=${todoId};`;
  await database.run(deleteTodo);
  resp.send("Todo Deleted");
});
