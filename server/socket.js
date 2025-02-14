require("dotenv").config();
const logger = require("./logger"); // Import the logger
const safeStringify = require("./utility/safeStringify");
const RaceSession = require("../models/RaceSession");
const {
  findRaceSessions,
  findSessionByStatus,
  createRaceSession,
  updateRaceSession,
  deleteRaceSession,
} = require("./raceSessionService");
const raceTime = process.env.NODE_ENV === "development" ? 60 : 600;

async function initSocket(io) {
  let raceSessions = null;
  let currentSession = null;
  let nextSession = null;
  let countdownTimer = null;
  let remainingTime = raceTime; // Default 10 minutes in seconds

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
        io.emit("currentSessionUpdate", currentSession);
      } else {
        currentSession = null;
        io.emit("currentSessionUpdate", null);
        logger.warn("No current session found.");
      }
    } catch (error) {
      logger.error("Error fetching current session:", error.message);
    }
  }

  // Start countdown and emit time updates
  function startCountdown() {
    remainingTime = currentSession ? currentSession.remainingTime : raceTime; // Reset time to 10 minutes

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
          io.emit("currentSessionUpdate", currentSession);
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

      startCountdown(); // Start the countdown timer
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
      // raceMode = "finish";

      clearInterval(countdownTimer); // Clear the countdown timer
      currentSession.remainingTime = 0;
      remainingTime = 0;

      // Persist update
      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      );

      io.emit("currentSessionUpdate", currentSession);
    } catch (error) {
      logger.error("Error finishing the race: ", error);
    }
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

      // Persist update
      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      );

      io.emit("currentSessionUpdate", currentSession);
    } catch (error) {
      logger.error("Error ending the session: ", error);
    }
  }

  // Listen for race session update
  io.on("connection", async (socket) => {
    logger.info(`socket.js connected: ${socket.id}`);

    await initializeSessions();

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

        // Persist update
        currentSession = await updateRaceSession(
          currentSession._id,
          currentSession
        );

        io.emit("currentSessionUpdate", currentSession);
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

        await createRaceSession(sessionData);

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

        await updateRaceSession(sessionData._id, sessionData);

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

    // Record laptime and fastest lap
    socket.on("recordLap", async ({ car, currentTime }) => {
      if (!currentSession) {
        logger.error("No current session to record laptime.");
        return;
      }

      let carData = currentSession.cars.find((c) => c.car === car);
      if (!carData) {
        logger.error(`Car ${car} not found in current session.`);
        return;
      }

      if (!carData.lastLapTime) {
        carData.lastLapTime = currentTime;
        carData.currentLap = 1;
        await updateRaceSession(currentSession._id, currentSession);
        await fetchCurrentSession();
        return;
      }

      const lapTime = (currentTime - carData.lastLapTime) / 1000;
      carData.lastLapTime = currentTime;

      if (!carData.fastestLap || lapTime < carData.fastestLap) {
        carData.fastestLap = lapTime;
      }

      carData.currentLap += 1;

      currentSession = await updateRaceSession(
        currentSession._id,
        currentSession
      ); // Persist update

      io.emit("currentSessionUpdate", currentSession);
    });

    socket.on("disconnect", () => {
      logger.warn(`socket.js disconnected: ${socket.id}`);
    });

    socket.on("reconnect", () => {
      logger.warn(`socket.js reconnected: ${socket.id}`);
      // Emit initial data
      initializeSessions();
    });

    // start the clock
    if (
      currentSession &&
      currentSession.mode !== "finish" &&
      currentSession.mode !== "ended"
    ) {
      startCountdown();
    }
  });
}

module.exports = { initSocket };
