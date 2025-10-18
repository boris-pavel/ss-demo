// hero-section.js
(async function () {
  const listingId = window.LISTING_ID || "97521";
  const slider = document.getElementById("hero-slider");
  const titleEl = document.getElementById("hero-title");
  const descEl = document.getElementById("hero-description");

  if (!slider || !titleEl) return;

  try {
    // Fetch all listings from your backend
    const res = await fetch("https://living-water-backend.onrender.com/listings-debug");
    const data = await res.json();

    // Extract listings
    const listings = data.result || [];
    const listing = listings.find((l) => String(l.id) === String(listingId)) || listings[0];
    if (!listing) throw new Error("Listing not found");

    // Update hero text
    titleEl.textContent = listing.name || "Listing Title";
    descEl.textContent = listing.airbnbSummary || listing.description || "Beautiful lakeside retreat";

    // Collect hero images (Hostaway returns listingImages array)
    const images = listing.listingImages?.map((img) => img.url).slice(0, 8) || [];

    if (images.length === 0) {
      slider.innerHTML = `<div class="flex items-center justify-center w-full h-full text-gray-400">
        No images found.
      </div>`;
      return;
    }

    // Build slider DOM
    slider.innerHTML = images
      .map(
        (src, i) => `
          <div class="min-w-full h-full flex-shrink-0 relative">
            <img src="${src}" 
                 alt="Listing Image ${i + 1}" 
                 class="object-cover w-full h-full" 
                 loading="${i === 0 ? "eager" : "lazy"}">
          </div>
        `
      )
      .join("");

    // Slider functionality
    let index = 0;
    const slides = slider.children;

    const showSlide = (i) => {
      index = (i + slides.length) % slides.length;
      slider.style.transform = `translateX(-${index * 100}%)`;
    };

    const prev = document.getElementById("prev-btn");
    const next = document.getElementById("next-btn");

    if (prev && next) {
      prev.addEventListener("click", () => showSlide(index - 1));
      next.addEventListener("click", () => showSlide(index + 1));
    }

    // Auto-rotate every 6s
    setInterval(() => showSlide(index + 1), 6000);
  } catch (err) {
    console.error("Error loading hero section:", err);
    if (slider)
      slider.innerHTML = `<div class="flex items-center justify-center w-full h-full text-gray-400">
        Failed to load hero section.
      </div>`;
  }
})();
