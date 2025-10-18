(async function () {
  const listingId = window.LISTING_ID || "97521";
  const mainEl = document.getElementById("hero-main");
  const thumbsEl = document.getElementById("hero-thumbs");
  const counterEl = document.getElementById("hero-counter");

  try {
    const res = await fetch("https://living-water-backend.onrender.com/listings-debug");
    const data = await res.json();

    const listings = data.result || [];
    const listing = listings.find((l) => String(l.id) === String(listingId)) || listings[0];
    if (!listing) throw new Error("Listing not found");

    const photos = listing.listingImages?.map((p) => p.url) || [];

    if (photos.length === 0) {
      mainEl.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400">No photos</div>`;
      return;
    }

    // Main hero photo
    mainEl.innerHTML = `
      <img src="${photos[0]}" 
           alt="Main listing image" 
           class="w-full h-full object-cover rounded-xl">
    `;

    // Thumbnails (next 4)
    thumbsEl.innerHTML = photos
      .slice(1, 5)
      .map(
        (src, i) => `
        <div class="relative rounded-xl overflow-hidden">
          <img src="${src}" alt="Listing image ${i + 1}" class="w-full h-full object-cover">
        </div>
      `
      )
      .join("");

    // Add photo counter if more than 5 photos
    if (photos.length > 5) {
      const extraCount = photos.length - 5;
      thumbsEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="relative rounded-xl overflow-hidden group">
          <img src="${photos[5]}" class="w-full h-full object-cover opacity-80 group-hover:opacity-60">
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-medium rounded-xl">
            +${extraCount} photos
          </div>
        </div>
      `
      );
    }
  } catch (err) {
    console.error("Error loading hero section:", err);
  }
})();
