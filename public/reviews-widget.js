(async function () {
  const listingId = window.LISTING_ID || "97521";
  const container = document.getElementById("reviews-container");
  const showAllBtn = document.getElementById("show-all-reviews");
  const ratingEl = document.getElementById("listing-rating");
  const badgeEl = document.getElementById("rating-badge");
  const summaryEl = document.getElementById("reviews-summary");
  if (!container) return;

  const reviewsUrl = `https://living-water-backend.onrender.com/reviews?listingId=${listingId}`;
  const VISIBLE_COUNT = 4;

  const formatDate = (value) => {
    if (!value) return "";
    const [datePart] = value.split(" ");
    const date = new Date(datePart);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const buildStars = (ratingOutOf10) => {
    const ratingOutOfFive = Number(ratingOutOf10 || 10) / 2;
    const rounded = Math.round(ratingOutOfFive * 2) / 2;
    let stars = "";
    for (let i = 1; i <= 5; i += 1) {
      stars += i <= rounded ? "&#9733;" : "&#9734;";
    }
    return `<span class="text-brand text-base tracking-tight">${stars}</span>`;
  };

  const shorten = (text, max = 240) => {
    if (!text) return { short: "", full: "", truncated: false };
    const trimmed = text.trim();
    if (trimmed.length <= max) {
      return { short: trimmed, full: trimmed, truncated: false };
    }
    const clipped = trimmed.slice(0, max).split(" ").slice(0, -1).join(" ");
    return { short: `${clipped}...`, full: trimmed, truncated: true };
  };

  try {
    const response = await fetch(reviewsUrl);
    const data = await response.json();
    const reviewsArray = Array.isArray(data.result) ? data.result : [];
    const guestReviews = reviewsArray.filter(
      (review) => review.type === "guest-to-host" || !review.type
    );

    if (!guestReviews.length) {
      container.innerHTML =
        '<div class="rounded-2xl bg-[#fbf8f3] px-4 py-3 text-sm text-muted text-center">No reviews available yet.</div>';
      if (showAllBtn) showAllBtn.classList.add("hidden");
      if (summaryEl) summaryEl.textContent = "No guest reviews yet";
      return;
    }

    const total = guestReviews.length;
    const sumRatings = guestReviews.reduce(
      (totalRating, item) => totalRating + Number(item.rating || 0),
      0
    );
    const averageRatingRaw = total > 0 ? sumRatings / total : 0;
    const averageRating = (averageRatingRaw / 2).toFixed(2);

    if (ratingEl) {
      ratingEl.innerHTML = `
        <span>${averageRating}</span>
        <span class="text-muted text-sm">${total} review${total === 1 ? "" : "s"}</span>
      `;
    }

    if (summaryEl) {
      summaryEl.textContent = `${averageRating} out of 5 across ${total} recent guest review${total === 1 ? "" : "s"}`;
    }

    if (badgeEl) {
      const badgeValue = badgeEl.querySelector("span:last-child");
      if (badgeValue) badgeValue.textContent = averageRating;
    }

    let showAll = false;

    const applyScrollState = () => {
      if (!container) return;
      if (showAll) {
        container.style.maxHeight = "28rem";
        container.style.overflowY = "auto";
        container.style.paddingRight = "0.25rem";
      } else {
        container.style.maxHeight = "";
        container.style.overflowY = "";
        container.style.paddingRight = "";
      }
    };

    const render = () => {
      const visibleReviews = showAll
        ? guestReviews
        : guestReviews.slice(0, VISIBLE_COUNT);

      container.innerHTML = visibleReviews
        .map((review, index) => {
          const { short, full, truncated } = shorten(review.publicReview);
          const reviewIndex = index;
          return `
            <article class="space-y-3 border-b border-[#f0e7da] pb-5 last:border-b-0 last:pb-0">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-ink">${review.reviewerName || "Guest"}</p>
                  <p class="text-xs text-muted">${formatDate(review.submittedAt)}</p>
                </div>
                <div class="flex items-center gap-2 text-sm text-brand font-medium">
                  ${buildStars(review.rating)}
                  <span class="text-xs text-muted">${(Number(review.rating || 0) / 2).toFixed(1)}</span>
                </div>
              </div>
              <p
                class="text-sm leading-relaxed text-[#5b564c]"
                data-full="${encodeURIComponent(full)}"
                data-short="${encodeURIComponent(short)}"
                data-truncated="${truncated}"
                id="review-text-${reviewIndex}"
              >
                ${short}
              </p>
              ${
                truncated
                  ? `<button
                      class="review-toggle text-sm font-semibold text-brand hover:text-ink transition"
                      data-target="review-text-${reviewIndex}"
                    >
                      Show more
                    </button>`
                  : ""
              }
            </article>
          `;
        })
        .join("");

      applyScrollState();

      const toggleButtons = container.querySelectorAll(".review-toggle");
      toggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const targetId = button.getAttribute("data-target");
          const textNode = document.getElementById(targetId);
          if (!textNode) return;
          const isExpanded = button.dataset.expanded === "true";
          const fullText = decodeURIComponent(textNode.getAttribute("data-full") || "");
          const shortText = decodeURIComponent(textNode.getAttribute("data-short") || "");

          textNode.textContent = isExpanded ? shortText : fullText;
          button.textContent = isExpanded ? "Show more" : "Show less";
          button.dataset.expanded = isExpanded ? "false" : "true";
        });
      });

      if (showAllBtn) {
        if (guestReviews.length <= VISIBLE_COUNT) {
          showAllBtn.classList.add("hidden");
        } else {
          showAllBtn.classList.remove("hidden");
          showAllBtn.textContent = showAll ? "Show fewer reviews" : `Show all ${guestReviews.length} reviews`;
        }
      }
    };

    render();

    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        showAll = !showAll;
        render();
        if (showAll) {
          container.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    container.innerHTML =
      '<div class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 text-center">Failed to load reviews.</div>';
    if (summaryEl) summaryEl.textContent = "Unable to load reviews";
    if (showAllBtn) showAllBtn.classList.add("hidden");
  }
})();
