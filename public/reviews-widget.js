(async function () {
  const LISTING_ID = window.LISTING_ID || "97521";
  const REVIEWS_URL = `https://living-water-backend.onrender.com/reviews?listingId=${LISTING_ID}`;
  const container = document.getElementById("reviews-container");
  if (!container) return;

  try {
    // Fetch reviews from backend
    const res = await fetch(REVIEWS_URL);
    const data = await res.json();

    // Some responses may wrap reviews inside `result`
    const reviews =
      data.result?.filter(
        (r) => r.type === "guest-to-host" && r.status === "published"
      ) || [];

    if (!reviews.length) {
      container.innerHTML =
        '<p class="text-center text-gray-400">No guest reviews available yet.</p>';
      return;
    }

    // Calculate average rating
    const avgRating =
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    const stars = Math.round(avgRating / 2);

    // Create header (sticky)
    let html = `
      <div class="sticky top-0 bg-white pb-3 border-b border-gray-100 z-10 text-center mb-4">
        <div class="text-yellow-500 text-xl">${"★".repeat(stars)}${"☆".repeat(
      5 - stars
    )}</div>
        <p class="text-gray-700 font-medium">${(avgRating / 2).toFixed(
          1
        )} / 5 average rating</p>
        <p class="text-gray-400 text-xs">${reviews.length} guest reviews</p>
      </div>
    `;

    // Split into initial (5) and remaining
    const firstBatch = reviews.slice(0, 5);
    const remaining = reviews.slice(5);

    // Render a review block
    function renderReview(r) {
      const starsCount = Math.round((r.rating || 0) / 2);
      const date = new Date(
        r.submittedAt || r.updatedOn || r.createdAt
      ).toLocaleDateString();
      return `
        <div class="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50">
          <div class="flex justify-between items-center mb-1">
            <span class="font-medium text-gray-800">${
              r.reviewerName || "Guest"
            }</span>
            <span class="text-yellow-500 text-sm">${"★".repeat(
              starsCount
            )}${"☆".repeat(5 - starsCount)}</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">${
            r.publicReview || ""
          }</p>
          <p class="text-xs text-gray-400">${date}</p>
        </div>
      `;
    }

    // Render first 5 reviews
    html += firstBatch.map(renderReview).join("");

    // “Show all” button if more than 5 reviews
    if (remaining.length > 0) {
      html += `
        <div class="text-center mt-4">
          <button id="show-all-reviews"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm">
            Show all ${reviews.length} reviews
          </button>
        </div>
      `;
    }

    container.innerHTML = html;

    // Handle Show All click
    const btn = document.getElementById("show-all-reviews");
    if (btn) {
      btn.addEventListener("click", () => {
        const allReviewsHtml = reviews.map(renderReview).join("");
        container.innerHTML = `
          <div class="sticky top-0 bg-white pb-3 border-b border-gray-100 z-10 text-center mb-4">
            <div class="text-yellow-500 text-xl">${"★".repeat(stars)}${"☆".repeat(
          5 - stars
        )}</div>
            <p class="text-gray-700 font-medium">${(avgRating / 2).toFixed(
              1
            )} / 5 average rating</p>
            <p class="text-gray-400 text-xs">${reviews.length} guest reviews</p>
          </div>
          ${allReviewsHtml}
          <div class="text-center mt-4">
            <button id="show-less-reviews"
              class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm">
              Show less
            </button>
          </div>
        `;

        // Collapse handler
        document
          .getElementById("show-less-reviews")
          .addEventListener("click", () => {
            container.innerHTML = html;
          });
      });
    }
  } catch (err) {
    console.error("Error loading reviews:", err);
    container.innerHTML =
      '<p class="text-center text-red-500">Error loading reviews.</p>';
  }
})();
