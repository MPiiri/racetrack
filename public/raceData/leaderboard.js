// Session object to hold all race-related data
let session = {
  remainingTime: 600, // 10 minutes in seconds
  updatedFlag: "red-flag", // Initial flag, will be updated dynamically
};

// Function to format time as MM:SS.d
function formatTime(timeInSeconds) {
  if (timeInSeconds === undefined || timeInSeconds === null) return '--:--';
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Function to render the leaderboard based on the session object
function renderLeaderboard() {
  // Sort leaderboard by fastest lap (ascending)
  session.cars.sort(
    (a, b) => (a.fastestLap || Infinity) - (b.fastestLap || Infinity)
  );

  // Assign positions based on sorted data
  session.cars.forEach((entry, index) => {
    entry.position = index + 1; // Positions will be assigned dynamically
  });

  // Create the leaderboard table
  let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Driver</th>
            <th>Car</th>
            <th>Current Lap</th>
            <th>Fastest Lap</th>
          </tr>
        </thead>
        <tbody>
    `;

  // Loop through the leaderboard data and populate the rows
  session.cars.forEach((entry) => {
    tableHTML += `
        <tr>
          <td>${entry.position}</td>
          <td>${entry.driver}</td>
          <td>${entry.car}</td>
          <td>${entry.currentLap || "--"}</td>
          <td>${formatTime(entry.fastestLap)}</td>
        </tr>
      `;
  });

  tableHTML += `</tbody></table>`;

  // Update the leaderboard container with the table and countdown
  document.querySelector("#leaderboard-container").innerHTML = `
      <div class="leaderboard-header">
        <h1 id="timer">${formatTime(session.remainingTime)}</h1>
        <h2 id="flag" class="${session.updatedFlag}"></h2>
      </div>
      ${tableHTML}
    `;
}

// Initialize a connection to the Socket.IO server
const socket = io();

// Listen for updates from the server and update the session object accordingly
socket.on(
  "race-control-update",
  ({ raceMode, raceSession, remainingTime, currentFlag }) => {
    console.log(
      "Race state received:",
      raceMode,
      raceSession,
      remainingTime,
      currentFlag
    );

    session.updatedFlag = currentFlag;
    session.remainingTime = remainingTime;

    socket.emit("updateSessionData", session);

    renderLeaderboard();
  }
);

// When the race starts
socket.on("race-started", ({ raceSession, raceMode }) => {
  console.log(`Race started: ${raceSession}`);
  socket.emit("updateSessionData", session);

  renderLeaderboard();
});

// Update the leaderboard data
socket.on("updateLeaderboard", (data) => {
  // Update the session object with the new leaderboard data
  session.cars = data; // Update the cars array with new data

  // Emit updated session data back to server
  socket.emit("updateSessionData", session);

  renderLeaderboard(); // Re-render leaderboard with updated cars data
});

// Update the countdown timer
socket.on("updateCountdown", (time) => {
  session.remainingTime = time; // Update remaining time in session object
  // Emit updated session data back to server
  socket.emit("updateSessionData", session);

  document.querySelector("#timer").textContent = formatTime(
    session.remainingTime
  ); // Update the displayed countdown
});

// Update the flag (new flag event logic)
socket.on("updateFlag", (flag) => {
  session.updatedFlag = flag; // Update the flag in session object

  // Emit updated session data back to server
  socket.emit("updateSessionData", session);

  renderLeaderboard(); // Re-render leaderboard when the flag is updated
});

// When the race finishes
socket.on("race-finished", () => {
  console.log("Race finished");
  session.updatedFlag = "chequered-flag"; // Set the flag to chequered when the race finishes

  // Emit updated session data back to server
  socket.emit("updateSessionData", session);

  renderLeaderboard(); // Re-render leaderboard when race is finished
});

// Initial render of the leaderboard
window.onload = function () {
  renderLeaderboard(); // Initial render when the page is loaded
};
