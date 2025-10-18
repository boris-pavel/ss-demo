(async function () {
  const listingId = window.LISTING_ID || "97521";
  const container = document.querySelector("#reviews-container");
  if (!container) return;

  try {
    const res = await fetch(`https://living-water-backend.onrender.com/reviews?listingId=${listingId}`);
    const data = await res.json();

    const reviews = Array.isArray(data.result) ? data.result : [];
    if (reviews.length === 0) {
      container.innerHTML = `<div class="text-gray-500 text-center">No reviews available.</div>`;
      return;
    }

    // Only include guest-to-host reviews if available
    const guestReviews = reviews.filter((r) => r.type === "guest-to-host" || !r.type);

    // Calculate average rating (Hostaway ratings are usually /10)
    const avg =
      guestReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
      (guestReviews.length || 1);
    const avgStars = (avg / 2).toFixed(1); // Convert 10 → 5-star scale

    // Render
    container.innerHTML = `
      <div class="mb-4 text-center">
        <div class="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800">
          <span class="text-yellow-500 text-xl">★</span>
          <span>${avgStars}</span>
          <span class="text-gray-500 text-base">· ${guestReviews.length} review${guestReviews.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div class="space-y-5">
        ${guestReviews
          .map(
            (r) => `
          <div class="border-b border-gray-100 pb-3">
            <div class="flex items-center justify-between text-sm">
              <div class="font-semibold">${r.reviewerName || "Anonymous"}</div>
              <div class="text-gray-400">${
                r.submittedAt ? r.submittedAt.split(" ")[0] : ""
              }</div>
            </div>
            <div class="text-yellow-500 text-sm mt-1">
              ${"★".repeat(Math.round((r.rating || 10) / 2))}
            </div>
            <p class="mt-1 text-gray-700 leading-snug">${
              r.publicReview || ""
            }</p>
          </div>`
          )
          .join("")}
      </div>
    `;
  } catch (err) {
    console.error("Error loading reviews:", err);
    container.innerHTML = `<div class="text-red-500 text-sm text-center">Failed to load reviews.</div>`;
  }
})();
