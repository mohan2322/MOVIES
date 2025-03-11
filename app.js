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
  response.send("Movie Added Successfully");
});

//API-GET-single-row
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //console.log(movieId);
  const getQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;

  const getBook = await db.get(getQuery);
  response.send(convertDobjectToResponseObj(getBook));
});
