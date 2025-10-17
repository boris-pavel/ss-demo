async function loadPhotos() {
  const PHOTOS_URL = "https://living-water-backend.onrender.com/photos";
  const LISTING_ID = "97521"; // replace with your real Hostaway listing ID
  const container = document.getElementById("photos-container");

  try {
    const res = await fetch(`${PHOTOS_URL}?listingId=${LISTING_ID}`);
    const data = await res.json();
    const photos = data.photos || [];

    if (!photos.length) {
      container.innerHTML = '<p class="text-center text-gray-400">No photos available.</p>';
      return;
    }

    let html = '<div class="grid grid-cols-2 md:grid-cols-3 gap-3">';
    photos.forEach(url => {
      html += `
        <div class="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition">
          <img src="${url}" alt="Property photo" class="w-full h-40 object-cover" loading="lazy" />
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  } catch (err) {
    console.error("Error loading photos:", err);
    container.innerHTML = '<p class="text-center text-red-500">Error loading photos.</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadPhotos);
