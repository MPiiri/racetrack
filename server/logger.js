const winston = require("winston");

// Define custom colors
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
});

// Define the logger with timestamp and log levels
const logger = winston.createLogger({
  level: "debug", //logLevel, // Set the minimum log level ("info", "warn", "error", "debug")
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      const colorizer = winston.format.colorize().colorize;
      return `[${timestamp}] ${colorizer(
        level,
        level.toUpperCase()
      )}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Logs to the console
    new winston.transports.File({ filename: "logs/app.log" }), // Logs to a file
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }), // Error logs only
  ],
});

// Export the logger so it can be used in other files
module.exports = logger;
