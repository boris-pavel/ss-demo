async function loadHostawayCalendar() {
  const BACKEND_URL = "https://living-water-backend.onrender.com/calendar";
  const LISTING_ID = "97521"; // replace with your actual Hostaway listing ID

  const container = document.getElementById("calendar-container");
  const title = document.getElementById("calendar-title");
  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();

  async function fetchCalendar(year, month) {
    const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    title.textContent = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

    container.innerHTML = `<div class="text-gray-400 text-sm text-center">Loading...</div>`;

    try {
      const res = await fetch(`${BACKEND_URL}?listingId=${LISTING_ID}&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      const days = (data.result || []).map(day => ({
        date: day.date,
        available: day.isAvailable === 1 || day.status === "available"
      }));
      renderCalendar(days);
    } catch (err) {
      console.error("Error loading calendar:", err);
      container.innerHTML = `<p class="text-red-500 text-center text-sm">Error loading data.</p>`;
    }
  }

  function renderCalendar(days) {
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-7 gap-2 text-center";

    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    weekdays.forEach(d => {
      const el = document.createElement("div");
      el.textContent = d;
      el.className = "text-xs text-gray-400 font-medium";
      grid.appendChild(el);
    });

    const firstDay = new Date(days[0].date).getDay();
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));

    days.forEach(day => {
      const el = document.createElement("div");
      el.textContent = new Date(day.date).getDate();
      el.className =
        "p-2 rounded-md text-sm transition-all duration-200 " +
        (day.available
          ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
          : "bg-red-100 text-red-700 line-through cursor-not-allowed");
      grid.appendChild(el);
    });

    container.innerHTML = "";
    container.appendChild(grid);
  }

  document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    fetchCalendar(currentYear, currentMonth);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    fetchCalendar(currentYear, currentMonth);
  });

  fetchCalendar(currentYear, currentMonth);
}
document.addEventListener("DOMContentLoaded", loadHostawayCalendar);
