const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const changingNames = (item) => {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  };
};

const directorNamesChange = (everyDirector) => {
  return {
    directorId: everyDirector.director_id,
    directorName: everyDirector.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getQuery = `
    SELECT 
        movie_name 
    FROM
        movie;`;
  const getResponse = await db.all(getQuery);
  response.send(
    getResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getSingleMovie = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id=${movieId};`;
  const getSingleResponse = await db.get(getSingleMovie);
  response.send(changingNames(getSingleResponse));
});

app.post("/movies/",async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},'${movieName}','${leadActor}');`;
  const postResponse =await db.run(postQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/",async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putQuery = `
    UPDATE movie
    SET director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}';`;
  const putResponse =await db.run(putQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/",async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  const deleteResponse =await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT *
    FROM director
    ;`;
  const directorResponse = await db.all(getDirectors);
  response.send(
    directorResponse.map((eachDirector) => directorNamesChange(eachDirector))
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const finalQuery = `
    SELECT
        movie_name
    FROM
        movie
    WHERE
        director_id='${directorId}'`;
  const finalResponse = await db.all(finalQuery);
  response.send(
    finalResponse.map((singleMovie) => ({ movieName: singleMovie.movie_name }))
  );
});
module.exports = app;
