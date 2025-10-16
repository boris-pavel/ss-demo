async function loadReviews() {
  const container = document.getElementById("reviews-container");
  try {
    const res = await fetch(`https://living-water-backend.onrender.com/reviews?listingId=97521`);
    const data = await res.json();
    const reviews = data.result?.filter(r => r.type === "guest-to-host" && r.status === "published") || [];
    if (!reviews.length) {
      container.innerHTML = '<p class="text-center text-gray-400">No guest reviews available yet.</p>';
      return;
    }
    const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    const stars = Math.round(avg / 2);
    let html = `
      <div class="text-center mb-6">
        <div class="text-yellow-500 text-xl">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</div>
        <p class="text-gray-700 font-medium mt-1">${(avg / 2).toFixed(1)} / 5 average rating</p>
        <p class="text-gray-400 text-xs">${reviews.length} guest reviews</p>
      </div>
    `;
    reviews.forEach(r => {
      const sc = Math.round((r.rating || 0) / 2);
      html += `
        <div class="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50 mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="font-medium text-gray-800">${r.reviewerName || "Guest"}</span>
            <span class="text-yellow-500 text-sm">${"★".repeat(sc)}${"☆".repeat(5 - sc)}</span>
          </div>
          <p class="text-gray-600 text-sm mb-1">${r.publicReview || ""}</p>
          <p class="text-xs text-gray-400">${new Date(r.submittedAt || r.updatedOn || r.createdAt).toLocaleDateString()}</p>
        </div>`;
    });
    container.innerHTML = html;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="text-center text-red-500">Error loading reviews.</p>`;
  }
}
document.addEventListener("DOMContentLoaded", () => setTimeout(loadReviews, 2000));
