const express = require("express");
const path = require("path");
const { validatePassword } = require("./auth"); // Import password validation logic (if it's in a separate file)
const User = require("../models/users"); // Import the User model for database operations

const publicFolder = "../public";

function setupRoutes(app) {
  // Serve static files (HTML, JS, CSS) from the 'public' directory
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Route to serve the main page (home page)
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "main.html")); // Serve the main HTML page
  });

  // Route to serve the Observer page (guest page)
  app.get("/leaderboard.html", (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public", "Interface", "leaderboard.html")
    ); // Serve the observer HTML page
  });

  // Route for validating passwords for employees (uses the 'validatePassword' function)
  app.post("/validate-password", validatePassword); // Handle password validation POST request

  // Route for creating a new user (guest or employee)
  app.post("/create-user", async (req, res) => {
    const { name, role } = req.body; // Get the 'name' and 'role' from the request body

    // Check if both 'name' and 'role' are provided in the request
    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" }); // Return an error if either is missing
    }

    try {
      // Check if a user with the same 'name' already exists in the database
      let user = await User.findOne({ name });

      if (user) {
        // If the user already exists, return a response with the existing user's data
        return res.status(200).json({ message: "User already exists", user });
      }

      // If the user doesn't exist, create a new user object with the provided 'name' and 'role'
      user = new User({ name, role });
      await user.save(); // Save the new user to the database

      // Return a success response with the created user's data
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error); // Log the error to the console
      res.status(500).json({ message: "Error creating user" }); // Return an internal server error response
    }
  });

  // Route for safety official interface
  app.get("/race-control", (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public", "users", "race-control.html")
    ); // Serve the safety official HTML page
  });

  // Route for receptionist interface
  app.get("/front-desk", (req, res) => {
    res.sendFile(
      path.join(__dirname, publicFolder, "users", "front-desk.html")
    ); // Front desk page
  });
}

module.exports = { setupRoutes }; // Export the setupRoutes function to be used in the main server file
