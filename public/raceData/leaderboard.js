// Initialize Socket.IO connection
const socket = io();

// Session object to hold all race-related data
let session = {
  remainingTime: null, // Time in seconds
  cars: [], // Cars array will be populated dynamically
  currentFlag: "",
  status: "",
  mode:""
};

// Function to format time as MM:SS
function formatTime(timeInSeconds) {
  if (timeInSeconds === undefined || timeInSeconds === null) return "--:--";
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// Function to update flag status
function updateFlagBasedOnMode() {
  session.currentFlag =
    {
      safe: "green-flag",
      hazard: "yellow-flag",
      danger: "red-flag",
      ended: "red-flag",
      finish: "chequered-flag",
    }[session.status] || "red-flag";

  // Ensure the flag element exists before updating
  const flagElement = document.getElementById("flag");
  if (flagElement) {
    flagElement.className = session.currentFlag;
  }
}

// Function to render the leaderboard (Only if it exists on this page)
function renderLeaderboard() {
  if (!document.getElementById("leaderboard-body")) return; // Prevent errors if leaderboard does not exist

  session.cars.sort((a, b) => (a.fastestLap || Infinity) - (b.fastestLap || Infinity));
  session.cars.forEach((entry, index) => {
    entry.position = index + 1;
  });

  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";

  session.cars.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.position}</td>
      <td>${entry.driver}</td>
      <td>${entry.car}</td>
      <td>${entry.currentLap || "--"}</td>
      <td>${formatTime(entry.fastestLap)}</td>
    `;
    tbody.appendChild(row);
  });
}

// Listen for leaderboard & flag updates
socket.on("currentSessionUpdate", (data) => {
  session.cars = data.cars;
  session.remainingTime = data.remainingTime;
  session.status = data.status;
  session.status = data.mode;

  // Update leaderboard if it exists
  if (document.getElementById("timer")) {
    document.getElementById("timer").textContent = formatTime(session.remainingTime);
  }

  // Update flag (this ensures all pages get updates)
  updateFlagBasedOnMode();

  // Render leaderboard (only if it's on the current page)
  renderLeaderboard();
});

// Initial render on page load (only if leaderboard exists)
window.onload = renderLeaderboard;
