(async function () {
  const listingId = window.LISTING_ID || "97521";
  const url = `https://living-water-backend.onrender.com/amenities?listingId=${listingId}`;
  const container = document.querySelector("#amenities-container");
  if (!container) return;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const amenities = data.amenities || [];
    if (amenities.length === 0) {
      container.innerHTML = `<div class="text-gray-500">No amenities listed.</div>`;
      return;
    }

    // Initial state
    let showAll = false;
    const render = () => {
      const items = showAll ? amenities : amenities.slice(0, 6);
      container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-gray-700">
          ${items.map((a) => `<div class="flex items-center gap-2">• ${a}</div>`).join("")}
        </div>
        ${
          amenities.length > 6
            ? `<div class="mt-3 text-center">
                <button id="toggle-amenities" class="text-sm text-blue-600 underline hover:text-blue-800">
                  ${showAll ? "Show less" : "Show all"}
                </button>
              </div>`
            : ""
        }
      `;

      // Attach button listener after rendering
      const btn = container.querySelector("#toggle-amenities");
      if (btn) {
        btn.addEventListener("click", () => {
          showAll = !showAll;
          render();
        });
      }
    };

    render();
  } catch (err) {
    console.error("Error loading amenities:", err);
    container.innerHTML = `<div class="text-red-500 text-sm">Failed to load amenities.</div>`;
  }
})();
