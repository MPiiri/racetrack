require("dotenv").config();
const { Schema, model } = require("mongoose");
const raceTime = process.env.NODE_ENV === "development" ? 60 : 600;

const raceSessionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  cars: [
    {
      driver: { type: String },
      car: { type: String },
      currentLap: { type: Number },
      fastestLap: { type: String },
      lastLapTime: { type: Number },
    },
  ],
  status: { type: String, default: "pending" }, // "pending", "started", etc.
  mode: { type: String, default: "danger" }, // "safe", "danger", etc.
  remainingTime: { type: Number, default: raceTime }, //
  createdAt: { type: Date, default: Date.now },
});

const RaceSession = model("RaceSession", raceSessionSchema);

module.exports = RaceSession;
