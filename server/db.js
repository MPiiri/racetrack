require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./logger"); // Import the logger

const mongoUri =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_MONGO_URI
    : process.env.MONGO_URI;

function connectDB() {
  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() =>
      logger.info(`Connected to MongoDB Atlas: ${process.env.NODE_ENV} mode`)
    )
    .catch((err) => logger.error("MongoDB Connection Error:", err));
}

module.exports = { connectDB };
