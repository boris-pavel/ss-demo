async function loadHeroPhotos() {
  const id = window.PHOTOS_LISTING_ID || window.LISTING_ID;
  const url = `https://living-water-backend.onrender.com/photos?listingId=${id}`;
  const main = document.getElementById("hero-main");
  const thumbs = document.getElementById("hero-thumbs");
  if (!main || !thumbs) return;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const photos = data.photos || [];
    if (!photos.length) return;

    // main
    main.src = photos[0].url || photos[0];

    // first 4 thumbs
    thumbs.innerHTML = photos.slice(1, 5).map(p => {
      const src = p.url || p;
      return `<div class="rounded-2xl overflow-hidden shadow"><img src="${src}" class="w-full h-[110px] md:h-[170px] object-cover cursor-pointer" data-src="${src}"></div>`;
    }).join("");

    // click thumb to swap main
    thumbs.querySelectorAll("img").forEach(img => {
      img.addEventListener("click", () => { main.src = img.dataset.src; });
    });
  } catch (e) {
    console.error("hero-photos error:", e);
  }
}
document.addEventListener("DOMContentLoaded", loadHeroPhotos);
