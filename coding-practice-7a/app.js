const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());
module.exports = app;

let database;
async function connectDatabase_and_startServer() {
  try {
    const db_path = path.join(__dirname, "cricketMatchDetails.db");
    database = await open({ filename: db_path, driver: sqlite3.Database });
    app.listen("3000");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
connectDatabase_and_startServer();

//getting all players
app.get("/players/", async (req, resp) => {
  const getPlayers = `select player_id as playerId, player_name as playerName
                     from player_details;`;
  let result = await database.all(getPlayers);
  resp.send(result);
});

//getting a player
app.get("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const getPlayer = `select player_id as playerId, player_name as playerName
                    from player_details where player_id=${playerId};`;
  let result = await database.get(getPlayer);
  resp.send(result);
});

//updating a player
app.put("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const { playerName } = req.body;

  const updatePlayer = `update player_details set player_name='${playerName}'
                          where player_id=${playerId};`;

  await database.run(updatePlayer);
  resp.send("Player Details Updated");
});

//getting a match details
app.get("/matches/:matchId", async (req, resp) => {
  const { matchId } = req.params;
  const getMatchDetails = `select match_id as matchId, match, year 
                       from match_details where match_id=${matchId};`;

  let result = await database.get(getMatchDetails);
  resp.send(result);
});

//getting matches of player
app.get("/players/:playerId/matches", async (req, resp) => {
  const { playerId } = req.params;
  const getPlayerMatches = `select match_details.match_id as matchId, 
                              match, year
                              from player_match_score join match_details on 
                              player_match_score.match_id=match_details.match_id
                              where player_id=${playerId};`;
  let result = await database.all(getPlayerMatches);

  resp.send(result);
});

//getting players of matches
app.get("/matches/:matchId/players", async (req, resp) => {
  const { matchId } = req.params;
  const getMatchPlayers = `select player_details.player_id as playerId, 
                            player_details.player_name as playerName
                            from player_match_score join player_details on 
                            player_match_score.player_id=player_details.player_id
                            where match_id=${matchId};`;

  let result = await database.all(getMatchPlayers);
  resp.send(result);
});

//getting stats of player
app.get("/players/:playerId/playerScores", async (req, resp) => {
  const { playerId } = req.params;
  const getPlayerStats = `select player_details.player_id as playerId, 
                            player_details.player_name as playerName, 
                            sum(score) as totalScore, sum(fours) as totalFours,
                            sum(sixes) as totalSixes from player_match_score 
                            join player_details on player_match_score.player_id=
                            player_details.player_id where 
                            player_details.player_id=${playerId};`;
  let result = await database.get(getPlayerStats);

  resp.send(result);
});
