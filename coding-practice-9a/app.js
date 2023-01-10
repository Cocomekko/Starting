const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
module.exports = app;

let database;
const connect_database_and_listen = async () => {
  const db_path = path.join(__dirname, "userData.db");
  try {
    database = await open({ filename: db_path, driver: sqlite3.Database });
    app.listen(3000);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connect_database_and_listen();

app.post("/register", async (req, resp) => {
  const { username, name, password, gender, location } = req.body;
  const getUser = `select * from user where username='${username}';`;
  const result = await database.get(getUser);
  if (result == undefined) {
    if (password.length < 5) {
      resp.status(400);
      resp.send("Password is too short");
    } else {
      const hashedPass = await bcrypt.hash(`${password}`, 1);
      const createUser = `insert into user 
                            (username, name, password, gender, location)
                            values 
        ('${username}', '${name}', '${hashedPass}', '${gender}', '${location}');`;

      await database.run(createUser);
      resp.send("User created successfully");
    }
  } else {
    resp.status(400);
    resp.send("User already exists");
  }
});

app.post("/login", async (req, resp) => {
  const { username, password } = req.body;
  const getUser = `select * from user where username='${username}';`;

  const result = await database.get(getUser);
  if (result == undefined) {
    resp.status(400);
    resp.send("Invalid user");
  } else {
    const passMatch = await bcrypt.compare(password, result.password);
    if (passMatch == true) {
      resp.send("Login success!");
    } else {
      resp.status(400);
      resp.send("Invalid password");
    }
  }
});

app.put("/change-password", async (req, resp) => {
  const { username, oldPassword, newPassword } = req.body;
  const getUser = `select * from user where username='${username}';`;
  const result = await database.get(getUser);

  const passMatch = await bcrypt.compare(oldPassword, result.password);

  if (passMatch == true) {
    if (newPassword.length < 5) {
      resp.status(400);
      resp.send("Password is too short");
    } else {
      const hashedPass = await bcrypt.hash(newPassword, 1);
      const updatePass = `update user set
                              password='${hashedPass}'
                              where username='${username}';`;
      await database.run(updatePass);
      resp.send("Password updated");
    }
  } else {
    resp.status(400);
    resp.send("Invalid current password");
  }
});
