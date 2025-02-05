const socket = io(); // Initialize Socket.IO client

let raceSessions = [];

let session = {
  name: "",
  drivers: [],
  status: "",
  createdAt: Date.now(),
};

// DOM Elements
const raceList = document.querySelector("#race-list tbody");
const createNewSessionBtn = document.getElementById("create-new-session-btn");
const editRaceForm = document.getElementById("edit-race-form");
const raceNameInput = document.getElementById("edit-race-name");
const raceStatusSelect = document.getElementById("edit-status");
const driversList = document.querySelector("#drivers-list tbody");
const addDriverNameInput = document.getElementById("add-driver-name");
const addDriverCarSelect = document.getElementById("add-driver-car");

// Utility Functions
const clearForm = () => {
  document.getElementById("edit-race-form-title").textContent =
    "Create New Race Session";
  editRaceForm.reset();
  document.getElementById("edit-race-id").value = "";
  driversList.innerHTML = "";

  // Reset carsData to make all cars available
  carsData.forEach((car) => (car.status = "available"));
  renderCarsDropdown(carsData);

  // Reset session data
  session = {
    name: "",
    cars: [],
    status: "",
    createdAt: Date.now(),
  };
};

socket.on("raceSessionsUpdated", (sessions) => {
  raceSessions = sessions;
  console.log("got new sessions:", sessions);

  raceList.innerHTML = ""; // Clear existing list

  sessions.forEach((session) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${session.name}</td>
      <td>${session.status}</td>
      <td>${session.mode}</td>
      <td>${session.cars.length}</td>
      <td>${new Date(session.createdAt).toLocaleString()}</td>
      <td class="actions">
        <button class="edit-btn" onclick="loadRaceSessionForEditing('${
          session._id
        }')">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="delete-btn" onclick="deleteRaceSession('${
          session._id
        }')">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;

    raceList.appendChild(row);
  });
});

// Event Listeners
createNewSessionBtn.addEventListener("click", () => {
  clearForm();
});

// Form submission
editRaceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  session.name = raceNameInput.value.trim();
  session.status = raceStatusSelect.value;

  // gathre drivers from drivers-list table
  session.cars = Array.from(driversList.querySelectorAll("tr")).map((row) => ({
    driver: row.children[0].textContent,
    car: row.children[1].textContent,
  }));

  // Validate inputs
  if (!session.name) {
    alert("Please enter a race name.");
    return;
  }

  if (session.cars.length < 1) {
    alert("Please add at least one driver.");
    return;
  }

  // Emit save or update
  if (session._id) {
    socket.emit("updateRaceSession", session);
  } else {
    socket.emit("createRaceSession", session);
  }

  clearForm();
});

// Cars data
const carsData = [
  { _id: "1", name: "Car 1", status: "available" },
  { _id: "2", name: "Car 2", status: "available" },
  { _id: "3", name: "Car 3", status: "available" },
  { _id: "4", name: "Car 4", status: "available" },
  { _id: "5", name: "Car 5", status: "available" },
  { _id: "6", name: "Car 6", status: "available" },
  { _id: "7", name: "Car 7", status: "available" },
  { _id: "8", name: "Car 8", status: "available" },
];

// Utility function to render cars into the dropdown
const renderCarsDropdown = (cars) => {
  addDriverCarSelect.innerHTML = '<option value="">Select Car</option>';
  cars.forEach((car) => {
    const option = document.createElement("option");
    option.value = car.name; // Use car name as the value
    option.textContent = car.name;

    // Disable car if it's already assigned
    if (car.status === "assigned") {
      option.disabled = true;
    }

    addDriverCarSelect.appendChild(option);
  });
};

// Fetch and display cars in the dropdown
const fetchCars = async () => {
  renderCarsDropdown(carsData);
};

// Add driver to the list
document.getElementById("add-driver-btn").addEventListener("click", () => {
  const driverName = addDriverNameInput.value.trim();
  const selectedOption =
    addDriverCarSelect.options[addDriverCarSelect.selectedIndex];
  const carName = selectedOption ? selectedOption.text : ""; // Get the text of the selected option

  if (!driverName) {
    alert("Please provide a valid driver.");
    return;
  }

  if (!carName) {
    alert("Please provide a valid car.");
    return;
  }

  // Mark the car as assigned
  const selectedCar = carsData.find((car) => car.name === carName);
  if (selectedCar) {
    selectedCar.status = "assigned";
  }

  // add driver to drivers list
  const row = document.createElement("tr");
  row.innerHTML = `
        <td>${driverName}</td>
        <td>${carName}</td>
        <td>
          <button class="remove-driver-btn">
            <i class="fas fa-times"></i>
          </button>
        </td>
      `;
  row.querySelector(".remove-driver-btn").addEventListener("click", () => {
    // Mark the car as available when the driver is removed
    if (selectedCar) {
      selectedCar.status = "available";
    }

    // Re-render the dropdown to make the car selectable again
    renderCarsDropdown(carsData);

    row.remove();
  });

  driversList.appendChild(row);

  // Re-render the dropdown to reflect assigned cars
  renderCarsDropdown(carsData);

  // Clear the input fields
  addDriverNameInput.value = "";
  addDriverCarSelect.value = "";
});

// Load race session for editing
const loadRaceSessionForEditing = (raceId) => {
  // Reset all car statuses to available before reassigning
  carsData.forEach((car) => (car.status = "available"));

  session = raceSessions.find((s) => s._id === raceId);

  // Render form changes
  document.getElementById(
    "edit-race-form-title"
  ).textContent = `Edit Race Session: ${session.name}`;
  document.getElementById("edit-race-id").value = session._id;
  raceNameInput.value = session.name;
  raceStatusSelect.value = session.status;

  // Assign cars already in use by this session's drivers
  session.cars.forEach((driver) => {
    const assignedCar = carsData.find((car) => car.name === driver.car);
    if (assignedCar) {
      assignedCar.status = "assigned";
    }
  });

  // Render cars dropdown
  renderCarsDropdown(carsData);

  // Populate drivers table
  driversList.innerHTML = "";
  session.cars.forEach((driver) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${driver.driver}</td>
        <td>${driver.car}</td>
        <td>
          <button class="remove-driver-btn">
            <i class="fas fa-times"></i>
          </button>
        </td>
      `;

    row.querySelector(".remove-driver-btn").addEventListener("click", () => {
      // Mark car as available
      const assignedCar = carsData.find((car) => car.name === driver.car);
      if (assignedCar) {
        assignedCar.status = "available";
      }

      // Re-render dropdown to update available cars
      renderCarsDropdown(carsData);

      row.remove();
    });

    driversList.appendChild(row);
  });
};

// Delete race session
const deleteRaceSession = async (raceId) => {
  if (confirm("Are you sure you want to delete this race session?")) {
    socket.emit("deleteRaceSession", raceId);
  }
};

socket.on("sessionUpdateError", (error) => {
  alert("Failed to update race session. Please try again.\n" + error);
});

// Initial data fetch
socket.emit("getRaceSessions");
fetchCars();
