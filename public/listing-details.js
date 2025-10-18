(async function () {
  const LISTINGS_URL = "https://living-water-backend.onrender.com/listings-debug";
  const listingId = window.LISTING_ID || "97521";

  const titleEl = document.getElementById("listing-title");
  const metaEl = document.getElementById("listing-meta");
  const ratingEl = document.getElementById("listing-rating");
  const badgeEl = document.getElementById("rating-badge");
  const descriptionEl = document.getElementById("listing-description");
  const descriptionToggle = document.getElementById("toggle-description");
  const rulesListEl = document.getElementById("house-rules-list");
  const rulesToggle = document.getElementById("toggle-house-rules");
  const cancellationEl = document.getElementById("cancellation-list");
  const mapEl = document.getElementById("map");
  const reviewsSummaryEl = document.getElementById("reviews-summary");

  if (!titleEl || !descriptionEl) return;

  try {
    const res = await fetch(LISTINGS_URL);
    const json = await res.json();
    const listings = Array.isArray(json.result) ? json.result : [];
    const listing =
      listings.find((item) => String(item.id) === String(listingId)) ||
      listings[0];

    if (!listing) return;

    window.__LIVING_WATERS_LISTING__ = listing;

    document.title = listing.name || document.title;
    titleEl.textContent =
      listing.name || "Beautiful waterfront home with modern comforts";

    const capacity = Number(listing.personCapacity) || 0;
    const bedrooms = Number(listing.bedroomsNumber) || 0;
    const bathrooms = Number(listing.bathroomsNumber || listing.guestBathroomsNumber) || 0;

    const metaParts = [];
    metaParts.push(
      capacity > 0 ? `${capacity} guest${capacity === 1 ? "" : "s"}` : "Guest-ready"
    );
    if (bedrooms) metaParts.push(`${bedrooms} bedroom${bedrooms === 1 ? "" : "s"}`);
    if (bathrooms) {
      const formattedBath =
        bathrooms % 1 === 0
          ? `${bathrooms}`
          : bathrooms.toFixed(1).replace(/\.0$/, "");
      metaParts.push(
        `${formattedBath} bathroom${bathrooms === 1 ? "" : "s"}`
      );
    }
    metaEl.textContent = metaParts.join(" • ");

    const averageRating = listing.averageReviewRating
      ? (Number(listing.averageReviewRating) / 2).toFixed(2)
      : null;

    if (averageRating && ratingEl) {
      ratingEl.innerHTML = `
        <span>${averageRating}</span>
        <span class="text-muted text-sm">Guest favorites</span>
      `;
    }

    if (averageRating && badgeEl) {
      const badgeValue = badgeEl.querySelector("span:last-child");
      if (badgeValue) badgeValue.textContent = averageRating;
    }

    if (reviewsSummaryEl && averageRating) {
      reviewsSummaryEl.textContent = `Guest rating ${averageRating}/5`;
    }

    const rawDescription = (listing.description || "").replace(/\r/g, "");
    const descriptionParagraphs = rawDescription
      .split(/\n{2,}/)
      .map((block) => block.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const fullDescription = descriptionParagraphs.join(" ");
    const shortDescription =
      fullDescription.length > 350
        ? `${fullDescription.slice(0, 330).split(" ").slice(0, -1).join(" ")}...`
        : fullDescription;

    let showFullDescription = false;
    const renderDescription = () => {
      descriptionEl.textContent = showFullDescription
        ? fullDescription
        : shortDescription;
      if (descriptionToggle) {
        descriptionToggle.textContent = showFullDescription
          ? "Show less"
          : "Show more";
      }
    };

    renderDescription();

    if (descriptionToggle) {
      descriptionToggle.addEventListener("click", () => {
        showFullDescription = !showFullDescription;
        renderDescription();
      });
    }

    const formatTime = (value) => {
      if (!value) return null;
      const [hours, minutes] = value.split(":").map(Number);
      if (Number.isNaN(hours)) return null;
      const suffix = hours >= 12 ? "pm" : "am";
      const h12 = ((hours + 11) % 12) + 1;
      const mins = minutes && minutes !== 0 ? `:${String(minutes).padStart(2, "0")}` : "";
      return `${h12}${mins} ${suffix}`;
    };

    const defaultRules = [
      `Check-in: ${formatTime(listing.checkInTimeStart) || "4 pm"}`,
      `Check-out: ${formatTime(listing.checkOutTime) || "10 am"}`,
    ];

    const houseRules = (listing.houseRules || "")
      .replace(/\r/g, "")
      .split(/\n{2,}/)
      .map((rule) =>
        rule
          .replace(/^[\?\-\•\s]+/, "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);

    const petsAllowed =
      typeof listing.maxPetsAllowed === "number" && listing.maxPetsAllowed > 0;
    if (petsAllowed) {
      defaultRules.push("Pets: allowed");
    } else {
      defaultRules.push("Pets: not allowed");
    }

    const smokingRule = houseRules.find((rule) =>
      /no smoking/i.test(rule)
    );
    if (smokingRule) {
      defaultRules.push("Smoking inside: not allowed");
    }

    const combinedRules = [...defaultRules, ...houseRules];
    let showAllRules = false;
    const renderRules = () => {
      if (!rulesListEl) return;
      const items = showAllRules ? combinedRules : combinedRules.slice(0, 4);
      rulesListEl.innerHTML = items
        .map((item) => `<li>${item}</li>`)
        .join("");
      if (rulesToggle) {
        rulesToggle.textContent = showAllRules ? "Show less" : "Show more";
      }
    };

    renderRules();

    if (rulesToggle) {
      rulesToggle.addEventListener("click", () => {
        showAllRules = !showAllRules;
        renderRules();
      });
    }

    if (cancellationEl && listing.cancellationPolicy) {
      const cancellationText = listing.cancellationPolicy
        .replace(/\r/g, "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4);
      if (cancellationText.length) {
        cancellationEl.innerHTML = cancellationText
          .map((line) => `<li>${line}</li>`)
          .join("");
      }
    }

    if (mapEl && typeof L === "object" && listing.lat && listing.lng) {
      const latitude = Number(listing.lat);
      const longitude = Number(listing.lng);
      const map = L.map(mapEl, { scrollWheelZoom: false }).setView(
        [latitude, longitude],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.circle([latitude, longitude], {
        radius: 1200,
        color: "#f05d5e",
        weight: 1,
        fillColor: "#f05d5e",
        fillOpacity: 0.25,
      }).addTo(map);
      L.marker([latitude, longitude]).addTo(map);
    }
  } catch (err) {
    console.error("Error loading listing details:", err);
  }
})();
