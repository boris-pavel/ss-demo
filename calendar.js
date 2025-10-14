// Simulate loading availability data from Hostaway
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("calendar-grid");
  const status = document.getElementById("calendar-status");
  const days = 30;

  // Fake loading delay
  setTimeout(() => {
    status.textContent = "Available dates shown below";

    for (let i = 1; i <= days; i++) {
      const day = document.createElement("div");
      const available = Math.random() > 0.3; // 70% chance available

      day.textContent = i;
      day.style.padding = "10px";
      day.style.borderRadius = "6px";
      day.style.border = "1px solid #ddd";
      day.style.background = available ? "#d4fcd4" : "#fcd4d4";
      day.style.cursor = available ? "pointer" : "not-allowed";
      day.style.transition = "0.2s";

      if (available) {
        day.onclick = () => alert(`You selected day ${i}. Booking flow would start here.`);
        day.onmouseover = () => (day.style.background = "#aaf7aa");
        day.onmouseout = () => (day.style.background = "#d4fcd4");
      }

      grid.appendChild(day);
    }
  }, 800);
});
