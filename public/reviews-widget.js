(async function () {
  const listingId = window.LISTING_ID || "97521";
  const container = document.querySelector("#reviews-container");
  if (!container) return;

  try {
    const res = await fetch(`https://living-water-backend.onrender.com/reviews?listingId=${listingId}`);
    const data = await res.json();

    const reviews = data.reviews || [];
    if (reviews.length === 0) {
      container.innerHTML = `<div class="text-gray-500 text-center">No reviews available.</div>`;
      return;
    }

    let showAll = false;

    const render = () => {
      const visible = showAll ? reviews : reviews.slice(0, 4);

      container.innerHTML = `
        <div class="space-y-4">
          ${visible
            .map(
              (r) => `
              <div class="border-b border-gray-100 pb-3">
                <div class="flex items-center justify-between text-sm">
                  <div class="font-semibold">${r.reviewerName || "Anonymous"}</div>
                  <div class="text-gray-400">${r.createdAt?.split("T")[0] || ""}</div>
                </div>
                <div class="text-yellow-500 text-sm mt-1">${"★".repeat(r.rating || 5)}</div>
                <p class="mt-1 text-gray-700 leading-snug">${r.comment || ""}</p>
              </div>`
            )
            .join("")}
        </div>
        ${
          reviews.length > 4
            ? `<div class="mt-4 text-center">
                <button id="toggle-reviews" class="text-sm text-blue-600 underline hover:text-blue-800">
                  ${showAll ? "Show less" : "Show all reviews"}
                </button>
              </div>`
            : ""
        }
      `;

      // Add click listener to toggle
      const toggleBtn = container.querySelector("#toggle-reviews");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          showAll = !showAll;
          render();
        });
      }
    };

    render();
  } catch (err) {
    console.error("Error loading reviews:", err);
    container.innerHTML = `<div class="text-red-500 text-sm text-center">Failed to load reviews.</div>`;
  }
})();
