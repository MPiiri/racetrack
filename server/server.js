const logger = require("./logger"); // Import the logger

// Catch Unhandled Errors Before Anything Else
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  logger.error(`Uncaught Exception: ${error.message} - ${error.stack}`);
  process.exit(1); // Exit process to avoid undefined state
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { connectDB } = require("./db");
const { initSocket } = require("./socket");
const { setupRoutes } = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const safeStringify = require("./utility/safeStringify");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust based on your frontend's origin
  },
});

// Middleware
app.use(express.json());
app.use(cors()); // If using separate front-end
app.use(bodyParser.json()); // Parse JSON data from incoming requests

// log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// log errors
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message} - ${err.stack}`);
  res.status(500).send("Internal Server Error");
});

// Add middleware to log all emitted events
io.use((socket, next) => {
  const originalEmit = socket.emit;

  // Override the `emit` function to log events
  socket.emit = function (event, ...args) {
    args = Array.isArray(args) ? args : []; // Ensure args is always an array

    const argsString =
      args.length > 0 ? args.map(safeStringify).join(", ") : "(no arguments)";

    logger.info(`Event in socket ${socket.id}: ${event} ${argsString}`);
    originalEmit.apply(socket, [event, ...args]);
  };

  next();
});

// Override `io.emit` separately to log global events
const originalIoEmit = io.emit;
io.emit = function (event, ...args) {
  args = Array.isArray(args) ? args : []; // Ensure args is always an array

  const argsString =
    args.length > 0 ? args.map(safeStringify).join(", ") : "(no arguments)";

  logger.info(`IO emitted event: ${event} ${argsString}`);
  originalIoEmit.apply(io, [event, ...args]);
};

// Connect to MongoDB database
connectDB();

// Initialize sockets asynchronously
(async () => {
  try {
    await initSocket(io); // Wait for session initialization
    logger.info("Socket.io initialized successfully");

    // Set up routes
    setupRoutes(app);
    logger.info("Routes set up successfully");

    logger.info("Starting server...");
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error(
      `Failed to initialize sockets:", ${error.message} - ${error.stack}`
    );
    process.exit(1); // Exit the process if initialization fails
  }
})();
