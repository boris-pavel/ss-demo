(async function () {
  const LISTING_ID = window.LISTING_ID || "97521";
  const AVAILABILITY_URL = `https://living-water-backend.onrender.com/availability?listingId=${LISTING_ID}`;

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
      const res = await fetch(AVAILABILITY_URL);
      const data = await res.json();

      // Hostaway returns results like data.result or data.calendar
      availabilityData = data.result || data.calendar || {};
      renderTwoMonths();
    } catch (err) {
      console.error("Error loading availability:", err);
      container.innerHTML = `<p class="text-red-500 text-sm text-center">Error loading availability</p>`;
    }
  }

 function renderTwoMonths() {
  const month1 = renderMonth(currentYear, currentMonth);
  const nextMonth = (currentMonth + 1) % 12;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const month2 = renderMonth(nextYear, nextMonth);

  title.textContent = `${new Date(
    currentYear,
    currentMonth
  ).toLocaleString("default", { month: "long", year: "numeric" })} & ${new Date(
    nextYear,
    nextMonth
  ).toLocaleString("default", { month: "long", year: "numeric" })}`;

  // keep both months in a horizontal flex layout
  container.innerHTML = `
    <div id="months-wrapper" class="flex flex-wrap md:flex-nowrap justify-center items-start gap-8 w-full overflow-hidden">
      ${month1}
      ${month2}
    </div>
  `;
}


  function renderMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const monthLabel = `${firstDay.toLocaleString("default", {
      month: "long",
    })} ${year}`;

    const today = new Date().toISOString().split("T")[0];
    let daysHTML = "";

    // pad before first day
    for (let i = 0; i < startWeekday; i++) daysHTML += `<div class="day empty"></div>`;

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayData = availabilityData[dateStr];
      const available = dayData ? dayData.available !== false : true;
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
        "flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-md text-sm cursor-pointer select-none transition-all duration-150",
        isPast ? "text-gray-300 cursor-not-allowed" : "",
        available
          ? "bg-green-50 hover:bg-green-100"
          : "bg-red-100 text-red-600 cursor-not-allowed",
        selected ? "bg-blue-600 text-white hover:bg-blue-600" : "",
      ]
        .filter(Boolean)
        .join(" ");

      daysHTML += `<div class="${cls}" data-date="${dateStr}">${d}</div>`;
    }

    return `
      <div class="bg-white rounded-2xl border border-gray-200 shadow p-5 min-w-[270px] md:min-w-[320px]">
        <div class="text-center font-semibold text-gray-800 mb-2">${monthLabel}</div>
        <div class="grid grid-cols-7 gap-1 text-center text-gray-600 mb-1 font-medium">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div class="grid grid-cols-7 gap-1 justify-items-center">${daysHTML}</div>
      </div>
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
    renderTwoMonths();
  }

  container.addEventListener("click", (e) => {
    const dayEl = e.target.closest(".day");
    if (!dayEl || dayEl.classList.contains("cursor-not-allowed")) return;
    const date = dayEl.dataset.date;

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

    renderTwoMonths();

    // highlight range
    const allDays = container.querySelectorAll(".day");
    allDays.forEach((d) => {
      const dStr = d.dataset.date;
      if (
        window.selectedStart &&
        window.selectedEnd &&
        dStr >= window.selectedStart &&
        dStr <= window.selectedEnd
      ) {
        d.classList.add("bg-blue-100");
      }
    });

    if (window._booking) {
      window._booking.setDatesLabel(window.selectedStart, window.selectedEnd);
    }
  });

  document
    .getElementById("prev-month")
    ?.addEventListener("click", () => changeMonth(-1));
  document
    .getElementById("next-month")
    ?.addEventListener("click", () => changeMonth(1));

  await loadAvailability();
})();
