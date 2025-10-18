(async function () {
  const listingId = window.LISTING_ID || "97521";
  const container = document.getElementById("amenities-container");
  const countEl = document.getElementById("amenities-count");
  if (!container) return;

  const fetchUrl = `https://living-water-backend.onrender.com/amenities?listingId=${listingId}`;
  const limit = 6;

  const icons = {
    wifi: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M5 9a12 12 0 0 1 14 0"></path>
        <path d="M8.5 12.5a7 7 0 0 1 7 0"></path>
        <path d="M12 16.5h.01"></path>
      </svg>
    `,
    ac: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="m12 2 1.5 4.5L18 6l-3.5 2.5L16 12l-4-2.5L8 12l1.5-3.5L6 6l4.5.5L12 2Z"></path>
        <path d="M12 13.5V22"></path>
      </svg>
    `,
    kitchen: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <rect x="4" y="3" width="16" height="8" rx="1.5"></rect>
        <path d="M7 11v8"></path>
        <path d="M17 11v8"></path>
        <path d="M3 21h18"></path>
      </svg>
    `,
    water: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M4 16s2 2 4 2 4-2 4-2 2 2 4 2 4-2 4-2"></path>
        <path d="M4 12s2 2 4 2 4-2 4-2 2 2 4 2 4-2 4-2"></path>
      </svg>
    `,
    flame: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M12 3s1.5 2.5 1 4.5c0 0 2-1 3 1 1 2-1 3.5-1 3.5"></path>
        <path d="M7 11c-1 1.5-1.5 3-1 4.5 1 4 8 4 9 0 .5-2-1-3.5-3-5.5"></path>
      </svg>
    `,
    check: `
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-brand" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="m5 12 4 4 10-10"></path>
      </svg>
    `,
  };

  const iconForAmenity = (name) => {
    const normalized = (name || "").toLowerCase();
    if (normalized.includes("wifi") || normalized.includes("internet")) return icons.wifi;
    if (normalized.includes("air") && normalized.includes("condition")) return icons.ac;
    if (normalized.includes("kitchen")) return icons.kitchen;
    if (normalized.includes("water") || normalized.includes("lakefront") || normalized.includes("waterfront"))
      return icons.water;
    if (normalized.includes("fire") || normalized.includes("pit")) return icons.flame;
    return icons.check;
  };

  try {
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const amenities = Array.isArray(data.amenities) ? data.amenities.filter(Boolean) : [];

    if (!amenities.length) {
      container.innerHTML =
        '<div class="rounded-2xl bg-[#fbf8f3] px-4 py-3 text-sm text-muted">No amenities listed yet.</div>';
      if (countEl) countEl.textContent = "";
      return;
    }

    let showAll = false;

    const render = () => {
      const items = showAll ? amenities : amenities.slice(0, limit);
      const cards = items
        .map(
          (amenity) => `
            <div class="flex items-center gap-3 rounded-2xl border border-[#eee2d4] bg-[#fbf8f3] px-4 py-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-brand border border-brand/20">
                ${iconForAmenity(amenity)}
              </span>
              <span class="text-sm font-medium text-ink">${amenity}</span>
            </div>
          `
        )
        .join("");

      container.innerHTML = `
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${cards}
        </div>
        ${
          amenities.length > limit
            ? `
              <div class="mt-6 flex justify-center">
                <button
                  id="toggle-amenities"
                  class="rounded-full border border-brand/30 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/10 transition"
                >
                  ${showAll ? "Show fewer amenities" : "Show all amenities"}
                </button>
              </div>
            `
            : ""
        }
      `;

      if (countEl) {
        countEl.textContent = showAll
          ? `Showing all ${amenities.length} amenities`
          : `Showing ${Math.min(limit, amenities.length)} of ${amenities.length} amenities`;
      }

      const toggleBtn = document.getElementById("toggle-amenities");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          showAll = !showAll;
          render();
        });
      }
    };

    render();
  } catch (error) {
    console.error("Error loading amenities:", error);
    container.innerHTML =
      '<div class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load amenities.</div>';
    if (countEl) countEl.textContent = "";
  }
})();
