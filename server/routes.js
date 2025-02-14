const express = require("express");
const path = require("path");
const { validatePassword } = require("./auth"); // Import password validation logic (if it's in a separate file)

const publicFolder = "../public";

function setupRoutes(app) {
  // Serve static files (HTML, JS, CSS) from the 'public' directory
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Route to serve the main page (home page)
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "main.html")); // Serve the main HTML page
  });

  // Route for validating passwords for employees (uses the 'validatePassword' function)
  app.post("/validatePassword", validatePassword); // Handle password validation POST request

  // Route for safety official interface
  app.get("/raceControl", (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public", "users", "raceControl.html")
    ); // Serve the safety official HTML page
  });

  // Route for receptionist interface
  app.get("/frontDesk", (req, res) => {
    res.sendFile(path.join(__dirname, publicFolder, "users", "frontDesk.html")); // Front desk page
  });

  // Route for lap line observer interface
  app.get("/lapLine", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "users", "lapLine.html")); // Serve the lap line HTML page
  });
}

module.exports = { setupRoutes }; // Export the setupRoutes function to be used in the main server file
