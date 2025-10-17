(async function () {
  const LISTING_ID = window.LISTING_ID || "97521";
  const CALENDAR_URL = `https://living-water-backend.onrender.com/calendar?listingId=${LISTING_ID}`;

  const container = document.getElementById("calendar-container");
  const title = document.getElementById("calendar-title");
  if (!container || !title) return;

  let availabilityData = {};
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  window.selectedStart = null;
  window.selectedEnd = null;

  async function loadAvailability() {
    try {
      const res = await fetch(CALENDAR_URL);
      const data = await res.json();
      availabilityData = data.result || data.calendar || {};
      renderCalendar();
    } catch (err) {
      console.error("Error loading calendar:", err);
      container.innerHTML = `<p class="text-red-500 text-sm text-center">Error loading availability</p>`;
    }
  }

  function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    title.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${currentYear}`;

    let daysHTML = "";
    const today = new Date().toISOString().split("T")[0];

    // pad before first day
    for (let i = 0; i < startWeekday; i++) {
      daysHTML += `<div class="h-10"></div>`;
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const available = availabilityData[dateStr] ? availabilityData[dateStr].available : true;
      const isPast = dateObj < new Date(today);
      const selected =
        (window.selectedStart && window.selectedStart === dateStr) ||
        (window.selectedEnd && window.selectedEnd === dateStr) ||
        (window.selectedStart &&
          window.selectedEnd &&
          dateStr > window.selectedStart &&
          dateStr < window.selectedEnd);

      const cls = [
        "day",
        "flex items-center justify-center rounded-md text-sm cursor-pointer select-none",
        "transition",
        isPast ? "text-gray-300 cursor-not-allowed" : "",
        available ? "bg-green-50 hover:bg-green-100" : "bg-red-50 text-red-500 cursor-not-allowed",
        selected ? "bg-blue-600 text-white" : "",
      ]
        .filter(Boolean)
        .join(" ");

      daysHTML += `<div class="${cls}" data-date="${dateStr}">${d}</div>`;
    }

    container.innerHTML = `
      <div class="grid grid-cols-7 gap-1 text-center text-gray-600 mb-2 font-medium">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      <div class="grid grid-cols-7 gap-1">${daysHTML}</div>
    `;
  }

  function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    } else if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  }

  // click events
  container.addEventListener("click", (e) => {
    const dayEl = e.target.closest(".day");
    if (!dayEl || dayEl.classList.contains("cursor-not-allowed")) return;
    const date = dayEl.dataset.date;

    // selection logic
    if (!window.selectedStart || (window.selectedStart && window.selectedEnd)) {
      window.selectedStart = date;
      window.selectedEnd = null;
    } else {
      const start = new Date(window.selectedStart);
      const end = new Date(date);
      if (end < start) {
        window.selectedEnd = window.selectedStart;
        window.selectedStart = date;
      } else {
        window.selectedEnd = date;
      }
    }

    renderCalendar();

    // highlight range
    if (window.selectedStart && window.selectedEnd) {
      const allDays = container.querySelectorAll(".day");
      allDays.forEach((d) => {
        const dStr = d.dataset.date;
        if (dStr >= window.selectedStart && dStr <= window.selectedEnd)
          d.classList.add("bg-blue-100");
      });
    }

    // update label on booking card
    if (window._booking) {
      window._booking.setDatesLabel(window.selectedStart, window.selectedEnd);
    }
  });

  document.getElementById("prev-month")?.addEventListener("click", () => changeMonth(-1));
  document.getElementById("next-month")?.addEventListener("click", () => changeMonth(1));

  await loadAvailability();
})();
