const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
module.exports = app;
const db_path = path.join(__dirname, "cricketTeam.db");
let db = null;
const connectToDb = async () => {
  try {
    db = await open({ filename: db_path, driver: sqlite3.Database });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
connectToDb();

let makeResponse = (result) => {
  return {
    playerId: result.player_id,
    playerName: result.player_name,
    jerseyNumber: result.jersey_number,
    role: result.role,
  };
};
// sends list of players
app.get("/players/", async (req, resp) => {
  const getPlayers = `select * from cricket_team;`;
  const result = await db.all(getPlayers);

  resp.send(result.map((obj) => makeResponse(obj)));
});

// create new player
app.post("/players/", async (req, resp) => {
  const { playerName, jerseyNumber, role } = req.body;
  const createPlayer = `insert into cricket_team (player_name, jersey_number, role)
                        values ('${playerName}', ${jerseyNumber}, '${role}');`;
  const result = await db.run(createPlayer);
  resp.send("Player Added to Team");
});

// get a player
app.get("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const get_a_Player = `select * from cricket_team where player_id = ${playerId};`;
  const player = await db.get(get_a_Player);
  resp.send(makeResponse(player));
});
// update a player
app.put("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const { playerName, jerseyNumber, role } = req.body;
  const updatePlayer = `update cricket_team
                        set player_name='${playerName}',
                        jersey_number = ${jerseyNumber},
                        role = '${role}'
                        where player_id = ${playerId};`;
  const player = await db.run(updatePlayer);
  resp.send("Player Details Updated");
});
// delete a player
app.delete("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const deletePlayer = `delete from cricket_team where player_id=${playerId};`;
  await db.run(deletePlayer);
  resp.send("Player Removed");
});
