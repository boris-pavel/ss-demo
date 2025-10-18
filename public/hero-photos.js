(async function () {
  const listingId = window.LISTING_ID || "97521";
  const mainEl = document.getElementById("hero-main");
  const thumbsEl = document.getElementById("hero-thumbs");

  // Create modal container
  const modal = document.createElement("div");
  modal.id = "photo-modal";
  modal.className = "fixed inset-0 bg-black/90 hidden items-center justify-center z-[9999]";
  modal.innerHTML = `
    <button id="close-modal" class="absolute top-6 right-6 text-white text-3xl font-light">×</button>
    <button id="prev-photo" class="absolute left-6 text-white text-3xl font-light">‹</button>
    <img id="modal-image" src="" class="max-h-[90vh] max-w-[90vw] object-contain rounded-lg">
    <button id="next-photo" class="absolute right-6 text-white text-3xl font-light">›</button>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector("#modal-image");
  const closeBtn = modal.querySelector("#close-modal");
  const nextBtn = modal.querySelector("#next-photo");
  const prevBtn = modal.querySelector("#prev-photo");

  let photos = [];
  let currentIndex = 0;

  function openModal(index) {
    if (!photos.length) return;
    currentIndex = index;
    modalImg.src = photos[index];
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % photos.length;
    modalImg.src = photos[currentIndex];
  }

  function prevPhotoFn() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    modalImg.src = photos[currentIndex];
  }

  closeBtn.addEventListener("click", closeModal);
  nextBtn.addEventListener("click", nextPhoto);
  prevBtn.addEventListener("click", prevPhotoFn);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  try {
    const res = await fetch("https://living-water-backend.onrender.com/listings-debug");
    const data = await res.json();
    const listings = data.result || [];
    const listing = listings.find((l) => String(l.id) === String(listingId)) || listings[0];
    if (!listing) throw new Error("Listing not found");

    photos = listing.listingImages?.map((p) => p.url) || [];

    if (photos.length === 0) {
      mainEl.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400">No photos</div>`;
      return;
    }

    // Main hero photo
    mainEl.innerHTML = `
      <img src="${photos[0]}" 
           alt="Main listing image" 
           class="w-full h-full object-cover rounded-xl cursor-pointer">
    `;
    mainEl.querySelector("img").addEventListener("click", () => openModal(0));

    // Thumbnails (next 4)
    thumbsEl.innerHTML = photos
      .slice(1, 5)
      .map(
        (src, i) => `
        <div class="relative rounded-xl overflow-hidden cursor-pointer">
          <img src="${src}" alt="Listing image ${i + 1}" class="w-full h-full object-cover">
        </div>
      `
      )
      .join("");

    const thumbDivs = thumbsEl.querySelectorAll("div");
    thumbDivs.forEach((div, i) => {
      div.addEventListener("click", () => openModal(i + 1));
    });

    // Add "+ photos" overlay if more images
    if (photos.length > 5) {
      const extraCount = photos.length - 5;
      thumbsEl.insertAdjacentHTML(
        "beforeend",
        `
        <div class="relative rounded-xl overflow-hidden group cursor-pointer" id="extra-photo-trigger">
          <img src="${photos[5]}" class="w-full h-full object-cover opacity-80 group-hover:opacity-60">
          <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-medium rounded-xl">
            +${extraCount} photos
          </div>
        </div>
      `
      );

      const extraBtn = document.getElementById("extra-photo-trigger");
      extraBtn.addEventListener("click", () => openModal(5));
    }
  } catch (err) {
    console.error("Error loading hero section:", err);
  }
})();
