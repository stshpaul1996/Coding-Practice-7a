const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is Running`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDataBaseAndServer();

//API-1
app.get("/players/", async (request, response) => {
  const playersGetQuery = `
    SELECT player_id AS playerId, player_name AS playerName
    FROM player_details`;
  const getPlayers = await db.all(playersGetQuery);
  response.send(getPlayers);
});

//API-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName 
    FROM player_details WHERE player_id = '${playerId}'`;
  const getPlayer = await db.get(getPlayerQuery);
  response.send(getPlayer);
});

//API-3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE player_details
  SET player_name = '${playerName}' WHERE player_id = '${playerId}'`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT match_id AS matchId, match, year
    FROM match_details WHERE match_id = '${matchId}'`;
  const getMatchDetails = await db.get(getMatchDetailsQuery);
  response.send(getMatchDetails);
});

//API-5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersMatchDetails = `
  SELECT match_id AS matchId, match, year 
  FROM match_details NATURAL JOIN player_match_score WHERE player_id = '${playerId}'`;
  const getPlayersMatch = await db.all(getPlayersMatchDetails);
  response.send(getPlayersMatch);
});

//API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersMatchQuery = `
    SELECT player_id AS playerId, player_name AS playerName 
    FROM player_details NATURAL JOIN player_match_score 
    WHERE match_id = '${matchId}'`;
  const getPlayersMatch = await db.all(getPlayersMatchQuery);
  response.send(getPlayersMatch);
});

//API-7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const statsPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName, 
    SUM(score) AS totalScore, SUM(fours) AS totalFours, 
    SUM(sixes) AS totalSixes FROM player_details NATURAL JOIN 
    player_match_score WHERE player_id = '${playerId}'`;
  const statsPlayer = await db.get(statsPlayerQuery);
  response.send(statsPlayer);
});

module.exports = app;
