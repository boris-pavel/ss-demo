(async function () {
  const listingId = window.LISTING_ID || "97521";
  const mainEl = document.getElementById("hero-main");
  const thumbsEl = document.getElementById("hero-thumbs");

  if (!mainEl || !thumbsEl) return;

  const modal = document.createElement("div");
  modal.id = "photo-modal";
  modal.className =
    "fixed inset-0 hidden z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm";
  modal.innerHTML = `
    <button
      id="close-modal"
      class="absolute top-6 right-6 text-white text-3xl font-light"
      aria-label="Close gallery"
    >
      &times;
    </button>
    <button
      id="prev-photo"
      class="absolute left-6 text-white text-3xl font-light"
      aria-label="Previous photo"
    >
      &#10094;
    </button>
    <img
      id="modal-image"
      src=""
      alt="Listing photo"
      class="max-h-[90vh] max-w-[90vw] object-contain rounded-3xl shadow-card"
    >
    <button
      id="next-photo"
      class="absolute right-6 text-white text-3xl font-light"
      aria-label="Next photo"
    >
      &#10095;
    </button>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector("#modal-image");
  const closeBtn = modal.querySelector("#close-modal");
  const nextBtn = modal.querySelector("#next-photo");
  const prevBtn = modal.querySelector("#prev-photo");

  let photos = [];
  let captions = [];
  let currentIndex = 0;

  function openModal(index) {
    if (!photos.length) return;
    currentIndex = index;
    modalImg.src = photos[index];
    modalImg.alt = captions[index] || `Listing photo ${index + 1}`;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % photos.length;
    modalImg.src = photos[currentIndex];
    modalImg.alt = captions[currentIndex] || `Listing photo ${currentIndex + 1}`;
  }

  function prevPhotoFn() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    modalImg.src = photos[currentIndex];
    modalImg.alt = captions[currentIndex] || `Listing photo ${currentIndex + 1}`;
  }

  closeBtn.addEventListener("click", closeModal);
  nextBtn.addEventListener("click", nextPhoto);
  prevBtn.addEventListener("click", prevPhotoFn);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  window.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowRight") nextPhoto();
    if (event.key === "ArrowLeft") prevPhotoFn();
  });

  async function loadListing() {
    if (window.__LIVING_WATERS_LISTING__) {
      return window.__LIVING_WATERS_LISTING__;
    }
    const res = await fetch(
      "https://living-water-backend.onrender.com/listings-debug"
    );
    const data = await res.json();
    const listings = Array.isArray(data.result) ? data.result : [];
    return (
      listings.find((item) => String(item.id) === String(listingId)) ||
      listings[0] ||
      null
    );
  }

  try {
    const listing = await loadListing();
    if (!listing) throw new Error("Listing not found");

    const listingPhotos = Array.isArray(listing.listingImages)
      ? listing.listingImages
      : [];

    photos = listingPhotos
      .map((item) => item?.url)
      .filter((url) => typeof url === "string" && url.startsWith("http"));
    captions = listingPhotos.map(
      (item, index) =>
        item?.bookingEngineCaption ||
        item?.airbnbCaption ||
        item?.caption ||
        `Listing photo ${index + 1}`
    );

    if (!photos.length) {
      mainEl.innerHTML =
        '<div class="flex h-full items-center justify-center rounded-3xl bg-[#f0f0f0] text-sm text-muted">Photos coming soon</div>';
      thumbsEl.innerHTML = "";
      return;
    }

    mainEl.innerHTML = `
      <img
        src="${photos[0]}"
        alt="${captions[0] || "Primary listing photo"}"
        class="w-full h-full object-cover rounded-3xl cursor-pointer transition duration-200 hover:scale-[1.01]"
      >
    `;
    const mainImg = mainEl.querySelector("img");
    if (mainImg) mainImg.addEventListener("click", () => openModal(0));

    const thumbMarkup = photos.slice(1, 5).map((src, index) => {
      const label = captions[index + 1] || `Listing photo ${index + 2}`;
      return `
        <div class="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[100px] bg-[#f0f0f0]">
          <img
            src="${src}"
            alt="${label}"
            class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          >
        </div>
      `;
    });

    thumbsEl.innerHTML = thumbMarkup.join("");

    Array.from(thumbsEl.children).forEach((node, index) => {
      node.addEventListener("click", () => openModal(index + 1));
    });

    if (photos.length > 5) {
      const extraIndex = 5;
      const extraCount = photos.length - extraIndex;
      const extraLabel = captions[extraIndex] || `Listing photo ${extraIndex + 1}`;
      thumbsEl.insertAdjacentHTML(
        "beforeend",
        `
          <div
            class="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[100px] bg-[#f0f0f0]"
            id="extra-photo-trigger"
          >
            <img
              src="${photos[extraIndex]}"
              alt="${extraLabel}"
              class="h-full w-full object-cover opacity-90 transition duration-200 group-hover:opacity-75"
            >
            <div class="absolute inset-0 flex items-center justify-center bg-black/45 text-white text-sm font-semibold">
              +${extraCount} photos
            </div>
          </div>
        `
      );
      const extraBtn = document.getElementById("extra-photo-trigger");
      if (extraBtn) {
        extraBtn.addEventListener("click", () => openModal(extraIndex));
      }
    }
  } catch (error) {
    console.error("Error loading hero section:", error);
    mainEl.innerHTML =
      '<div class="flex h-full items-center justify-center rounded-3xl bg-[#f0f0f0] text-sm text-red-600">Unable to load photos</div>';
  }
})();
