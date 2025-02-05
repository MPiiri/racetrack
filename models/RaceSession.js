const { Schema, model } = require("mongoose");

const raceSessionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  cars: [
    {
      driver: { type: String, required: true, unique: true },
      car: { type: String, required: true, unique: true },
      currentLap: { type: String },
      fastestLap: { type: String },
    },
  ],
  status: { type: String, default: "pending" }, // "pending", "started", etc.
  mode: { type: String, default: "danger" }, // "safe", "danger", etc.
  remainingTime: { type: Number, default: 600 }, //
  createdAt: { type: Date, default: Date.now },
});

const RaceSession = model("RaceSession", raceSessionSchema);

module.exports = RaceSession;
