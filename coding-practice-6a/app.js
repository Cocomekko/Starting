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
    const db_path = path.join(__dirname, "covid19India.db");
    database = await open({ filename: db_path, driver: sqlite3.Database });
    app.listen("3000");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
connectDatabase_and_startServer();

const makeResponse = (obj) => ({
  stateId: obj.state_id,
  stateName: obj.state_name,
  population: obj.population,
});

const makeResponse2 = (obj) => ({
  districtId: obj.district_id,
  districtName: obj.district_name,
  stateId: obj.state_id,
  cases: obj.cases,
  cured: obj.cured,
  active: obj.active,
  deaths: obj.deaths,
});

//getting all states
app.get("/states/", async (req, resp) => {
  const getStates = `select * from state;`;
  let result = await database.all(getStates);
  resp.send(
    result.map((obj) => {
      return makeResponse(obj);
    })
  );
});

//getting a state
app.get("/states/:stateId", async (req, resp) => {
  const { stateId } = req.params;
  const getState = `select * from state where state_id=${stateId};`;
  let result = await database.get(getState);
  resp.send(makeResponse(result));
});

//creating a district
app.post("/districts/", async (req, resp) => {
  const { districtName, stateId, cases, cured, active, deaths } = req.body;

  const createDistrict = `insert into district
    (district_name,state_id,cases,cured,active,deaths)
    values ('${districtName}', ${stateId}, ${cases}, ${cured},
             ${active}, ${deaths});`;

  await database.run(createDistrict);
  resp.send("District Successfully Added");
});

//getting a district
app.get("/districts/:districtId", async (req, resp) => {
  const { districtId } = req.params;
  const getDistrict = `select * from district where district_id=${districtId};`;

  let result = await database.get(getDistrict);
  resp.send(makeResponse2(result));
});

//deleting a district
app.delete("/districts/:districtId", async (req, resp) => {
  const { districtId } = req.params;
  const getDistrict = `delete from district where district_id=${districtId};`;

  await database.run(getDistrict);
  resp.send("District Removed");
});

//updating a district
app.put("/districts/:districtId", async (req, resp) => {
  const { districtId } = req.params;
  const { districtName, stateId, cases, cured, active, deaths } = req.body;

  const updateDistrict = `update district set 
                       district_name='${districtName}', state_id=${stateId}, 
                       cases=${cases}, cured=${cured}, active=${active}, 
                       deaths=${deaths} where district_id=${districtId};`;

  await database.run(updateDistrict);
  resp.send("District Details Updated");
});

//getting stats of state
app.get("/states/:stateId/stats/", async (req, resp) => {
  const { stateId } = req.params;
  const getStats = `select sum(cases) as totalCases, 
                    sum(cured) as totalCured, sum(active) as totalActive, 
                    sum(deaths) as totalDeaths
    from district where state_id=${stateId};`;
  let result = await database.get(getStats);

  resp.send(result);
});

//getting district name
app.get("/districts/:districtId/details/", async (req, resp) => {
  const { districtId } = req.params;
  const getDistrict = `select state_name as stateName from state join district 
  on state.state_id=district.state_id where district_id=${districtId};`;
  const result = await database.get(getDistrict);
  resp.send(result);
});
