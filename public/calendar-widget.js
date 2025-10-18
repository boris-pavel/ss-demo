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
        "flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl text-sm font-medium select-none transition-all duration-150",
      ];

      if (available && !isPast) {
        cls.push(
          "bg-white text-ink border border-transparent hover:border-brand/40 hover:text-brand cursor-pointer"
        );
      } else {
        cls.push("bg-[#f3ece1] text-[#b7a893] cursor-not-allowed");
      }

      if (isPast) {
        cls.push("text-[#c9bda8] cursor-not-allowed hover:border-transparent");
      }

      if (selected) {
        cls.push("bg-ink text-white hover:text-white hover:border-ink");
      }

      const className = cls.join(" ");

      daysHTML += `<div class="${className}" data-date="${dateStr}">${d}</div>`;
    }

    return `
      <div class="rounded-3xl border border-[#efe3d4] bg-white/90 shadow-sm p-5 min-w-[270px] md:min-w-[320px]">
        <div class="text-center font-semibold text-ink mb-3">${monthLabel}</div>
        <div class="grid grid-cols-7 gap-1 text-center text-muted mb-2 text-xs uppercase tracking-wide">
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
        if (d.classList.contains("bg-ink")) {
          d.classList.add("text-white");
        } else {
          d.classList.add("bg-brand/10", "text-brand");
        }
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
