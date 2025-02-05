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

    if (!job || !password) {
      alert("Please select a job and enter a password.");
      return;
    }

    try {
      const response = await fetch("/validate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, password }),
      });

      const data = await response.json();
      if (data.success) {
        if (job === "Receptionist") {
          sessionStorage.setItem("authenticatedFront", "true");
          window.location.href = "/front-desk";
        } else if (job === "Safety Official") {
          sessionStorage.setItem("authenticatedSafety", "true");
          window.location.href = "/race-control";
        }
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error validating password:", error);
      alert("An error occurred while validating the password. Please try again.");
    }
  });
});
