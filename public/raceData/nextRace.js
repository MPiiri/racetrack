      const socket = io();
        let next = null;

        socket.on("connect", () => {
            socket.emit("getNextSession");
            socket.emit("getCurrentSession");
        });

        socket.on("nextSessionUpdate", (nextSession) => {
            const tableBody = document.getElementById("sessionTableBody");
            tableBody.innerHTML = "";
            next = nextSession;

            if (nextSession && nextSession.cars) {
                nextSession.cars.forEach(car => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${car.driver}</td><td>${car.car}</td>`;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = "<tr><td colspan='2'>No upcoming session</td></tr>";
            }
        });

        socket.on("currentSessionUpdate", (currentSession) => {
            setTimeout(() => {
                if (currentSession.mode === "ended" && next) { // Ensure 'next' exists
                    const call = document.getElementById("call");
                    call.innerText = "\n Drivers, please go to your assigned cars!";
                } else {
                    const call = document.getElementById("call");
                    call.innerText = "";
                }
            }, 100);
        });
