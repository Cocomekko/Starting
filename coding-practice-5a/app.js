const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
module.exports = app;

const db_path = path.join(__dirname, "moviesData.db");
let db = null;

async function connectToDb() {
  try {
    db = await open({ filename: db_path, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("listening");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
connectToDb();

let makeResponse = (result) => {
  return {
    movieId: result.movie_id,
    directorId: result.director_id,
    playerName: result.player_name,
    movieName: result.movie_name,
    leadActor: result.lead_actor,
  };
};
let makeResponse2 = (result) => {
  return {
    movieName: result.movie_name,
  };
};
let makeResponse3 = (result) => {
  return {
    directorId: result.director_id,
    directorName: result.director_name,
  };
};
// returns list of movies
app.get("/movies/", async (req, resp) => {
  const getMovies = `select * from movie;`;
  const result = await db.all(getMovies);

  resp.send(result.map((obj) => makeResponse2(obj)));
});

// create a movie
app.post("/movies/", async (req, resp) => {
  const { directorId, movieName, leadActor } = req.body;
  const insertMovie = `insert into 
                       movie (director_id, movie_name, lead_actor) 
                       values (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(insertMovie);
  resp.send("Movie Successfully Added");
});

// return a movie
app.get("/movies/:movieId", async (req, resp) => {
  const { movieId } = req.params;
  const getMovie = `select * from movie where movie_id=${movieId};`;
  const result = await db.get(getMovie);
  resp.send(makeResponse(result));
});

// update a movie
app.put("/movies/:movieId", async (req, resp) => {
  const { directorId, movieName, leadActor } = req.body;
  const { movieId } = req.params;
  const updateMovie = `update movie 
                        set director_id=${directorId}, movie_name='${movieName}'
                        , lead_actor='${leadActor}' where movie_id=${movieId};`;
  await db.run(updateMovie);
  resp.send("Movie Details Updated");
});

// delete a movie
app.delete("/movies/:movieId", async (req, resp) => {
  const { movieId } = req.params;
  const deleteMovie = `delete from movie where movie_id=${movieId};`;
  await db.run(deleteMovie);
  resp.send("Movie Removed");
});

//returns list of directors
app.get("/directors/", async (req, resp) => {
  const getdirectors = `select * from director;`;
  const result = await db.all(getdirectors);

  resp.send(result.map((obj) => makeResponse3(obj)));
});

app.get("/directors/:directorId/movies/", async (req, resp) => {
  const { directorId } = req.params;
  const getDirectorMovies = `select * from movie where director_id=${directorId};`;
  const result = await db.all(getDirectorMovies);

  resp.send(result.map((obj) => makeResponse2(obj)));
});
