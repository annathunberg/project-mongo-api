import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import seasonsData from "./data/seasonsData.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Port the app will run on. Defaults to 8080.
const port = process.env.PORT || 8080;
const app = express();

// Enables cors and json body parsing
app.use(cors());
app.use(express.json());

// MODEL
const Seasons = mongoose.model("Seasons", {
  season: Number,
  released: Number,
  number_of_contestants: Number,
  winner: String,
  miss_congeniality: String,
});

// Resets the database. Previous data is deleted (deleteMany),
// then the new data is set with save() (in order to avoid duplicated data)
if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Seasons.deleteMany();

    seasonsData.forEach((item) => {
      const newSeason = new Seasons(item);
      newSeason.save();
    });
  };
  seedDatabase();
}

// Middleware checks if the database is connected before moving forward with endpoints
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: "Service unavailable" });
  }
});

// ROUTES

// home route sends an html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// route with all seasons
app.get("/seasons", (req, res) => {
  res.json(seasonsData);
});

// route specific season
app.get("/seasons/:season", (req, res) => {
  const seasonId = Number(req.params.season);

  const season = seasonsData.find((s) => s.season === seasonId);

  if (!season) {
    res.status(404).send("no season found with that id");
  } else {
    res.json(season);
  }
});

// error if the path does not exist in the api, * means all other paths than the ones listed above get this message
app.get("*", (req, res) => {
  res.send(`Sorry, don't know that path`);
});

// Starts the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
