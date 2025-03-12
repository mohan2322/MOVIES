const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/movies/");
    });
  } catch (e) {
    console.log(`DB SERVER ERROR: ${e.message}`);
    process.exit(1);
  }
};
initializeDbServer();

const convertDobjectToResponseObj = (dObject) => {
  return {
    movieId: dObject.movie_id,
    directorId: dObject.director_id,
    movieName: dObject.movie_name,
    leadActor: dObject.lead_actor,
  };
};

const convertObject = (eachDirec) => {
  return {
    directorId: eachDirec.director_id,
    directorName: eachDirec.director_name,
  };
};
//API-GET
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(
    moviesList.map((eachObj) => convertDobjectToResponseObj(eachObj))
  );
});
//API-POST
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  let r = await db.run(createMovieQuery);
  console.log(r.lastID);
  response.send("Movie Successfully Added");
});

//API-GET-single-row
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;

  const getBook = await db.get(getQuery);
  response.send(convertDobjectToResponseObj(getBook));
});

//UPDATE_API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE 
        movie 
    SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'

    WHERE 
        movie_id=${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM
     movie 
    WHERE
     movie_id=${movieId};`;

  const dbResponse = await db.run(deleteMovieQuery);

  response.send("Movie Removed");
});

//
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;

  const dbRes = await db.all(getDirectorsQuery);
  response.send(dbRes.map((eachObj) => convertObject(eachObj)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectoMovies = `
    SELECT 
        movie_name
    FROM
        movie 
    WHERE 
        director_id=${directorId};`;
  const directorsList = await db.all(getDirectoMovies);

  const v = convertDobjectToResponseObj(directorsList);
  response.send(directorsList);
});

module.exports = app;
