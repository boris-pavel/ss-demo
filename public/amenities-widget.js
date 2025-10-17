(async function () {
  const listingId = window.LISTING_ID || "97521";
  const url = `https://living-water-backend.onrender.com/amenities?listingId=${listingId}`;

  const container = document.querySelector("#amenities-container");
  if (!container) return;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.amenities || data.amenities.length === 0) {
      container.innerHTML = `<div class="text-gray-500">No amenities listed.</div>`;
      return;
    }

    // Create grid layout
    container.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-gray-700">
        ${data.amenities
          .map((a) => `<div class="flex items-center gap-2">• ${a}</div>`)
          .join("")}
      </div>
    `;
  } catch (err) {
    console.error("Error loading amenities:", err);
    container.innerHTML = `<div class="text-red-500 text-sm">Failed to load amenities.</div>`;
  }
})();
