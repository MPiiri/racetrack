const socket = io();

let currentSession = null;
let nextSession = null;

// DOM Elements
const startRaceButton = document.getElementById("start-race");
const finishRaceButton = document.getElementById("finish-race");
const endSessionButton = document.getElementById("end-session");
const makeCurrentButton = document.getElementById("make-current-button");
const timerDisplay = document.getElementById("timer");

const currentSessionTable = {
  name: document.getElementById("current-session-name"),
  status: document.getElementById("current-session-status"),
  mode: document.getElementById("current-session-mode"),
};

const nextSessionTable = {
  name: document.getElementById("next-session-name"),
  status: document.getElementById("next-session-status"),
  mode: document.getElementById("next-session-mode"),
};

const modeButtons = document.querySelectorAll(".mode-button");
const statusButtons = document.querySelectorAll(".status-button");

// Update Session Tables
socket.on("nextSessionUpdate", (session) => {
  console.log(`Next session update: ${JSON.stringify(session)}`);
  nextSession = session;
  updateSessionTable(nextSessionTable, session);
  makeCurrentButton.disabled = !session;
});

socket.on("currentSessionUpdate", (session) => {
  console.log(`Current session update: ${JSON.stringify(session)}`);
  currentSession = session;
  updateSessionTable(currentSessionTable, session);
  toggleModeButtons(session?.mode);
});

// TODO: if current session update comes with remaining time, then might want to use that
// Listen for the 'updateCountdown' event
socket.on("updateCountdown", (remainingTime) => {
  timerDisplay.textContent = formatTime(remainingTime);
});

// Handle "Make Current" Button Click
makeCurrentButton.addEventListener("click", () => {
  socket.emit("setCurrentSession", nextSession);
});

// Handle Status Button Clicks
startRaceButton.addEventListener("click", () => {
  socket.emit("start-race");
});

finishRaceButton.addEventListener("click", () => {
  socket.emit("finish-race");
});

endSessionButton.addEventListener("click", () => {
  socket.emit("end-session");
});

// Handle Mode Button Clicks
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    if (currentSession && currentSession.status !== "ended") {
      socket.emit("change-race-mode", mode);
    }
  });
});

function updateSessionTable(table, session) {
  if (session) {
    table.name.textContent = session.name || "N/A";
    table.status.textContent = session.status || "N/A";
    table.mode.textContent = session.mode || "N/A";
  } else {
    table.name.textContent = "No session";
    table.status.textContent = "-";
    table.mode.textContent = "-";
  }
}

function toggleModeButtons(mode) {
  modeButtons.forEach((button) => {
    button.disabled = mode === "finish";
  });
}

// Function to format time as MM:SS
function formatTime(timeInSeconds) {
  if (timeInSeconds === undefined || timeInSeconds === null) return "--:--";
  const minutes = Math.floor(timeInSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
