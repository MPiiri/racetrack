const socket = io();
let raceActive = false;
let startTime = null;
let currentSession = null;

const statusBanner = document.getElementById("status-banner");
const lapLineContainer = document.getElementById("lap-line-container");

// Render car buttons
function renderButtons() {
    lapLineContainer.innerHTML = ""; //clear existing buttons

    if (currentSession && currentSession.cars) {
        const sortedCars = currentSession.cars.sort((a, b) => {
            // Extract the numeric part from the car identifier
            const carNumberA = parseInt(a.car.match(/\d+/)[0], 10);
            const carNumberB = parseInt(b.car.match(/\d+/)[0], 10);
            return carNumberA - carNumberB;
        });

        sortedCars.forEach((car) => {
            const button = document.createElement("button");
            button.textContent = `${car.car}`;
            button.disabled = !raceActive;
            button.classList.add("car-button");
            button.addEventListener("click", () => recordLap ( car.car ));
            lapLineContainer.appendChild(button);
        });
    }
}

//record lap time
function recordLap(car) {
    const currentTime = Date.now(); //current time-stamp
    socket.emit("recordLap", { car, currentTime });
};

socket.on("currentSessionUpdate", (session) => {
  statusBanner.textContent = session ? `Current Session: ${session.mode}` : "No Active Session";

    if (!session) {
        raceActive = false;
        startTime = null;
        lapLineContainer.innerHTML = ""; // Clear buttons
        return;
    }

    currentSession = session;

    raceActive = session.mode === "safe" || session.mode === "hazard";

    if (session.mode === "finish" || session.mode === "danger") {
        raceActive = false
    }

    if (session.mode === "ended") {
        raceActive = false
        lapLineContainer.innerHTML = ""; // Clear buttons
    }

    renderButtons();
});

// Request current session when client loads or refreshes
socket.emit("getCurrentSession");