const mongoose = require("mongoose");
const logger = require("./logger"); // Import the logger

const uri =
  "mongodb+srv://mats:mina@qa.l0mge.mongodb.net/?retryWrites=true&w=majority&appName=QA";

function connectDB() {
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => logger.info("Connected to MongoDB Atlas"))
    .catch((err) => logger.error("MongoDB connection error:", err));
}

module.exports = { connectDB };
