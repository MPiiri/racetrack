const logger = require("./logger"); // Import the logger
const RaceSession = require("../models/RaceSession");

/**
 * Fetch all race sessions, sorted by creation date.
 * @returns {Promise<Array>} List of race sessions.
 */
async function findRaceSessions() {
  try {
    return await RaceSession.find().sort({ createdAt: 1 });
  } catch (error) {
    logger.error("Error fetching race sessions: " + error.message);
  }
}

/**
 * Find a single session by its status.
 * @param {Array<string>} statuses - Array of statuses to match.
 * @returns {Promise<Object|null>} Matching session or null if not found.
 */
async function findSessionByStatus(statuses) {
  try {
    return await RaceSession.findOne({ status: { $in: statuses } });
  } catch (error) {
    logger.error("Error finding session by status: " + error.message);
  }
}

/**
 * Find a session by its ID.
 * @param {string} id - Session ID.
 * @returns {Promise<Object|null>} Matching session or null if not found.
 */
async function findSessionById(id) {
  try {
    return await RaceSession.findById(id);
  } catch (error) {
    logger.error("Error fetching session by ID: " + error.message);
  }
}

/**
 * Create a new race session.
 * @param {Object} sessionData - Data for the new session.
 * @returns {Promise<Object>} The newly created session.
 */
async function createRaceSession(sessionData) {
  try {
    const newSession = new RaceSession(sessionData);
    return await newSession.save();
  } catch (error) {
    logger.error("Error creating race session: " + error.message);
  }
}

/**
 * Update an existing session by its ID.
 * @param {string} id - Session ID.
 * @param {Object} updatedData - Updated session data.
 * @returns {Promise<Object|null>} Updated session or null if not found.
 */
async function updateRaceSession(id, updatedData) {
  try {
    return await RaceSession.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (error) {
    logger.error("Error updating race session: " + error.message);
  }
}

/**
 * Update the status of a session by its ID.
 * @param {string} id - Session ID.
 * @param {string} status - New status for the session.
 * @returns {Promise<Object|null>} Updated session or null if not found.
 */
async function updateSessionStatus(id, status) {
  try {
    const session = await RaceSession.findById(id);
    if (session) {
      session.status = status;
      return await session.save();
    }
    return null;
  } catch (error) {
    logger.error("Error updating session status: " + error.message);
  }
}

/**
 * Update the mode of a session by its ID.
 * @param {string} id - Session ID.
 * @param {string} mode - New mode for the session.
 * @returns {Promise<Object|null>} Updated session or null if not found.
 */
async function updateSessionMode(id, mode) {
  try {
    const session = await RaceSession.findById(id);
    if (session) {
      session.mode = mode;
      return await session.save();
    }
    return null;
  } catch (error) {
    logger.error("Error updating session status: " + error.message);
  }
}

/**
 * Delete a session by its ID.
 * @param {string} id - Session ID.
 * @returns {Promise<boolean>} True if deletion was successful.
 */
async function deleteRaceSession(id) {
  try {
    const result = await RaceSession.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    logger.error("Error deleting race session: " + error.message);
  }
}

module.exports = {
  findRaceSessions,
  findSessionByStatus,
  findSessionById,
  createRaceSession,
  updateRaceSession,
  updateSessionStatus,
  updateSessionMode,
  deleteRaceSession,
};
