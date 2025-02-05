const logger = require("./logger"); // Import the logger
const safeStringify = require("./utility/safeStringify");
const RaceSession = require("../models/RaceSession");
const {
  findRaceSessions,
  findSessionByStatus,
  findSessionById,
  createRaceSession,
  updateRaceSession,
  updateSessionStatus,
  updateSessionMode,
  deleteRaceSession,
} = require("./raceSessionService");

async function initSocket(io) {
  let raceSessions = null;
  let currentSession = null;
  let nextSession = null;
  let countdownTimer = null;
  let remainingTime = 600; // Default 10 minutes in seconds
  let raceMode = "safe"; // Default mode is safe
  let currentFlag = "red-flag"; // Default to green flag

  // Initialize sessions
  async function initializeSessions() {
    try {
      logger.debug("Initializing session data in socket.js");
      await fetchRaceSessions();
      await fetchCurrentSession();
      await fetchNextSession();
    } catch (error) {
      logger.error("Error initializing sessions: " + error.message);
    }
  }

  let leaderboardData = []; // Define your leaderboard data here

  async function fetchRaceSessions() {
    try {
      raceSessions = await findRaceSessions();

      io.emit("raceSessionsUpdated", raceSessions);
    } catch (error) {
      logger.error("Error fetching race sessions: " + error.message);
    }
  }

  async function fetchNextSession() {
    try {
      // Fetch the session with status "next"
      nextSession = await findSessionByStatus(["next"]);

      io.emit("nextSessionUpdate", nextSession);
    } catch (error) {
      logger.error("Error fetching next session:", error.message);
    }
  }

  // Fetch current session from MongoDB
  async function fetchCurrentSession() {
    try {
      // Fetch the session with status "current"
      currentSession = await RaceSession.findOne({ status: "current" });

      if (currentSession) {
        leaderboardData = currentSession.cars
          .map((car) => ({
            driver: car.driver,
            car: car.car,
            fastestLap: car.fastestLap,
          }))
          .sort((a, b) => parseFloat(a.fastestLap) - parseFloat(b.fastestLap));

        raceMode = currentSession.mode;
        remainingTime = currentSession.remainingTime;
        startCountdown();

        updateFlagBasedOnMode();
        io.emit("updateCountdown", remainingTime); // Send updated time to clients
        io.emit("updateLeaderboard", leaderboardData);
        io.emit("currentSessionUpdate", currentSession);
      } else {
        currentSession = null;
        leaderboardData = [];
        raceMode = "danger";
        remainingTime = 0;

        updateFlagBasedOnMode();
        io.emit("updateCountdown", remainingTime); // Send updated time to clients
        io.emit("updateLeaderboard", leaderboardData);
        io.emit("currentSessionUpdate", null);
        logger.warn("No current session found.");
      }
    } catch (error) {
      logger.error("Error fetching current session:", error.message);
    }
  }

  // Update current session and leaderboard data every second
  // setInterval(fetchCurrentSession, 1000);

  // TODO do we need this handling logic?
  async function handleNextSession(session) {
    // If the incoming session is marked as "next"
    if (session.status === "next") {
      // If there's already a "next" session, update its status to "ready"
      if (nextSession && nextSession._id !== session._id) {
        const currentNextSession = await RaceSession.findById(nextSession._id);
        if (currentNextSession) {
          currentNextSession.status = "ready";
          currentNextSession.mode = "danger";
          await updateRaceSession(currentNextSession._id, currentNextSession);
        }
      }
    }
  }

  // Function to update the flag based on the current race mode
  function updateFlagBasedOnMode() {
    currentFlag =
      {
        safe: "green-flag",
        hazard: "yellow-flag",
        danger: "red-flag",
        ended: "red-flag",
        finish: "chequered-flag",
      }[raceMode] || "green-flag";

    logger.debug("updateFlag: " + currentFlag);
    io.emit("updateFlag", currentFlag); // Emit flag update to clients
  }

  // Start countdown and emit time updates
  function startCountdown() {
    remainingTime = currentSession ? currentSession.remainingTime : 600; // Reset time to 10 minutes

    if (countdownTimer) clearInterval(countdownTimer); // Clear existing countdown

    countdownTimer = setInterval(async () => {
      if (remainingTime > 0) {
        try {
          remainingTime--; // Decrement time
          currentSession.remainingTime = remainingTime;
          // Persist update
          currentSession = await updateRaceSession(
            currentSession._id,
            currentSession
          );
          await fetchCurrentSession();
          await fetchRaceSessions();
        } catch (error) {
          logger.error("Error starting the countdown: ", error);
        }
      } else {
        // time has run out
        clearInterval(countdownTimer);
        // Only finish the race if the session is NOT marked as "ended"
        if (currentSession && currentSession.mode !== "ended") {
          finishRace();
        }
      }
    }, 1000); // Update every second
  }

  //Start race
  async function startRace() {
    if (!currentSession) {
      logger.error("No current session to start the race.");
      return;
    }

    try {
      currentSession.mode = "safe";
      raceMode = "safe";

      updateFlagBasedOnMode(); // Update the flag based on the race mode
      startCountdown(); // Start the countdown timer

      // Persist update
      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      );
      await fetchCurrentSession();
      await fetchRaceSessions();
    } catch (error) {
      logger.error("Error starting the race: ", error);
    }
  }

  // Finish race
  async function finishRace() {
    if (!currentSession) {
      logger.error("No current session to finish the race.");
      return;
    }

    try {
      currentSession.mode = "finish";
      raceMode = "finish";
      updateFlagBasedOnMode(); // Update the flag based on the race mode

      clearInterval(countdownTimer); // Clear the countdown timer
      currentSession.remainingTime = 0;
      remainingTime = 0;

      // Persist update
      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      );

      await fetchCurrentSession();
      await fetchRaceSessions();
    } catch (error) {
      logger.error("Error finishing the race: ", error);
    }

    updateFlagBasedOnMode(); // Update the flag based on the race mode
  }

  // End session
  async function endSession() {
    logger.debug("Ending session...");
    if (!currentSession) {
      logger.error("No current session to end the session.");
      return;
    }

    try {
      logger.debug("Ending session: " + currentSession);
      currentSession.mode = "ended";

      clearInterval(countdownTimer); // Clear the countdown timer
      currentSession.remainingTime = 0;
      remainingTime = 0;

      // Persist update
      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      );

      await fetchCurrentSession();
      await fetchRaceSessions();
    } catch (error) {
      logger.error("Error ending the session: ", error);
    }
  }

  // Listen for race session update
  io.on("connection", async (socket) => {
    logger.info(`socket.js connected: ${socket.id}`);

    await initializeSessions();

    socket.emit("updateLeaderboard", leaderboardData); // Send current leaderboard to the new client
    // Handle adding a driver to the leaderboard manually
    socket.on(
      "addDriverToLeaderboard",
      ({ driverName, carModel, fastestLap }) => {
        // Manually add a driver to the leaderboard
        const newDriver = { driver: driverName, car: carModel, fastestLap };
        leaderboardData.push(newDriver);

        // Emit updated leaderboard to all connected clients
        socket.emit("updateLeaderboard", leaderboardData);
      }
    );

    // Handle updating next session
    socket.on("nextSessionUpdate", (session) => {
      nextSession = session;
    });

    // Get next session
    socket.on("getNextSession", async () => {
      logger.debug("[S] Fetching next session...");

      try {
        await fetchNextSession();
      } catch (error) {
        logger.error("Error fetching next session: " + error.message);
        socket.emit("sessionUpdateError", "Failed to get next session");
      }
    });

    // Handle updating current session
    socket.on("currentSessionUpdate", (session) => {
      currentSession = session;
    });

    // Get current session
    socket.on("getCurrentSession", async () => {
      logger.debug("[S] Fetching current session...");

      try {
        await fetchCurrentSession();
      } catch (error) {
        logger.error("Error getting current session: " + error.message);
        socket.emit("sessionUpdateError", "Failed to get current session");
      }
    });

    socket.on("setCurrentSession", async (session) => {
      logger.debug("[S] Set current session to: " + safeStringify(session));

      if (currentSession) {
        try {
          currentSession.status = "ready";
          currentSession.status = "danger";
          await updateRaceSession(currentSession._id, currentSession);
        } catch (error) {
          logger.error("Error updating current session: ", error);
          socket.emit("sessionUpdateError", "Failed to set current session");
        }
      }

      if (!session) {
        currentSession = null;
        return socket.emit("currentSessionUpdate", null);
      }

      try {
        // Ensure session is saved with the correct status
        session.status = "current";
        session.mode = "danger";
        // Persist update
        currentSession = await updateRaceSession(session._id, session);

        // Broadcast update
        await fetchCurrentSession();
        await fetchNextSession();
        await fetchRaceSessions();
      } catch (error) {
        logger.error("Error setting current session: ", error);
        socket.emit("sessionUpdateError", "Failed to set current session");
      }
    });

    // Update current session
    socket.on("updateCurrentSession", async (session) => {
      logger.info("Updating current session: " + session);
      if (!session) {
        return socket.emit(
          "sessionUpdateError",
          "Invalid current session data provided for update."
        );
      }

      try {
        // Persist update
        currentSession = await updateRaceSession(session._id, session);

        // Emit updates

        await fetchRaceSessions();
        await fetchCurrentSession();
      } catch (error) {
        logger.error("Error updating current session: ", error);
        socket.emit("sessionUpdateError", "Failed to update current session");
      }
    });

    // Race Control

    socket.on("start-race", () => {
      startRace();
    });

    socket.on("finish-race", () => {
      finishRace();
    });

    socket.on("end-session", () => {
      endSession();
    });

    // Change race mode
    socket.on("change-race-mode", async (mode) => {
      if (!currentSession) {
        logger.error("No current session to change the mode.");
        return;
      }

      try {
        currentSession.mode = mode;
        raceMode = mode; //update mode

        updateFlagBasedOnMode(); // Update the flag based on the race mode

        // Persist update
        currentSession = await updateRaceSession(
          currentSession._id,
          currentSession
        );

        await fetchCurrentSession();
        await fetchRaceSessions();
      } catch (error) {
        logger.error("Error changing the race mode: ", error);
      }
    });

    // Get all race sessions
    socket.on("getRaceSessions", async () => {
      try {
        logger.debug("[S] Fetching race sessions...");

        await fetchRaceSessions();
      } catch (error) {
        socket.emit("sessionUpdateError", error.message);
        logger.error("Failed to get race sessions", error);
      }
    });

    // Create a new session
    socket.on("createRaceSession", async (sessionData) => {
      try {
        logger.debug("[S] Creating race session: " + sessionData);
        const newSession = await createRaceSession(sessionData);
        await handleNextSession(newSession);
        await fetchNextSession();
        await fetchRaceSessions();
      } catch (error) {
        socket.emit("sessionUpdateError", error.message);
        logger.error("Failed to create race session", error);
      }
    });

    // Update an existing race session
    socket.on("updateRaceSession", async (sessionData) => {
      try {
        logger.debug(
          "[S] Updating race session: " + safeStringify(sessionData)
        );

        const updatedSession = await updateRaceSession(
          sessionData._id,
          sessionData
        );

        await handleNextSession(updatedSession);
        await fetchNextSession();
        await fetchRaceSessions();
      } catch (error) {
        socket.emit("sessionUpdateError", error);
        logger.error("Failed to update race session", error);
      }
    });

    // Delete a race session
    socket.on("deleteRaceSession", async (id) => {
      try {
        logger.debug("[S] Deleting race session: " + id);

        await deleteRaceSession(id);

        await fetchRaceSessions();
      } catch (error) {
        socket.emit("sessionUpdateError", error);
        logger.error("Error deleting race session:", error);
      }
    });

    socket.on("disconnect", () => {
      logger.warn(`socket.js disconnected: ${socket.id}`);
    });

    socket.on("reconnect", () => {
      logger.warn(`socket.js reconnected: ${socket.id}`);
      // Emit initial data
      initializeSessions();
    });
  });
}

module.exports = { initSocket };
