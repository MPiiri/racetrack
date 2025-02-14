document.addEventListener("DOMContentLoaded", function () {
  // Guest iframe and controls
  const guestRoleSelect = document.getElementById("guest-role");
  const guestIframe = document.getElementById("guest-iframe");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  // Automatically load selected Guest view in the iframe
  guestRoleSelect.addEventListener("change", () => {
    const selectedView = guestRoleSelect.value;
    guestIframe.src = selectedView;
  });

  // Fullscreen mode for the Guest iframe
  fullscreenBtn.addEventListener("click", () => {
    if (guestIframe.requestFullscreen) {
      guestIframe.requestFullscreen();
    } else if (guestIframe.mozRequestFullScreen) {
      guestIframe.mozRequestFullScreen();
    } else if (guestIframe.webkitRequestFullscreen) {
      guestIframe.webkitRequestFullscreen();
    } else if (guestIframe.msRequestFullscreen) {
      guestIframe.msRequestFullscreen();
    } else {
      alert("Fullscreen mode is not supported on your browser.");
    }
  });

  // Employee form submission
  const employeeSubmit = document.getElementById("employee-submit");
  employeeSubmit.addEventListener("click", async () => {
    const job = document.getElementById("employee-job").value;
    const password = document.getElementById("employee-password").value;

    try {
      const response = await fetch("/validatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, password }),
      });

      const data = await response.json();
      if (data.success) {
        if (job === "Receptionist") {
          sessionStorage.setItem("authenticatedFront", "true");
          window.location.href = "/frontDesk";
        } else if (job === "Safety Official") {
          sessionStorage.setItem("authenticatedSafety", "true");
          window.location.href = "/raceControl";
        }
        if (job === "Lap-line Observer") {
          sessionStorage.setItem("authenticatedLap", "true");
          window.location.href = "/lapLine";
        }
        alert(data.message);
      } else if (!job || !password) {
        setTimeout(() => {
          alert("Please select a job and enter a password.");
        }, 500);
      } else {
        setTimeout(() => {
          alert(data.message);
        }, 500);
      }
    } catch (error) {
      console.error("Error validating password:", error);
      alert(
        "An error occurred while validating the password. Please try again."
      );
    }
  });

  document.getElementById("guest-tab").addEventListener("click", function () {
    document.getElementById("guest-content").classList.add("active-content");
    document
      .getElementById("employee-content")
      .classList.remove("active-content");

    document.getElementById("guest-tab").classList.add("active-tab");
    document.getElementById("employee-tab").classList.remove("active-tab");
  });

  document
    .getElementById("employee-tab")
    .addEventListener("click", function () {
      document
        .getElementById("employee-content")
        .classList.add("active-content");
      document
        .getElementById("guest-content")
        .classList.remove("active-content");

      document.getElementById("employee-tab").classList.add("active-tab");
      document.getElementById("guest-tab").classList.remove("active-tab");

      document.getElementById("employee-password").style.display = "block";
      document.getElementById("employee-submit").style.display = "block";
    });

  resizeIframe();
});
