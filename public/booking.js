(function () {
  const listingId = window.LISTING_ID ? Number(window.LISTING_ID) : null;
  let guests = 1;

  // expose hooks for calendar widget
  window._booking = {
    setDatesLabel(arrival, departure) {
      const el = document.getElementById("selected-dates-label");
      if (!el) return;
      if (arrival && departure) el.textContent = `Selected: ${arrival} to ${departure}`;
      else if (arrival) el.textContent = `Selected: ${arrival} - select check-out`;
      else el.textContent = "Select check-in and check-out dates";
    }
  };

  // guest controls
  const label = document.getElementById("guests-label");
  const inc = document.getElementById("guests-inc");
  const dec = document.getElementById("guests-dec");
  if (inc && dec && label) {
    inc.onclick = () => { guests = Math.min(guests + 1, 12); label.textContent = String(guests); };
    dec.onclick = () => { guests = Math.max(1, guests - 1); label.textContent = String(guests); };
  }

  // calendar modal
  const calendarModal = document.getElementById("calendar-modal");
  const calendarTriggers = document.querySelectorAll("[data-open-calendar]");
  const calendarCloseButtons = document.querySelectorAll("[data-close-calendar-modal]");

  function openCalendarModal() {
    if (!calendarModal) return;
    calendarModal.classList.remove("hidden", "opacity-0");
    calendarModal.classList.add("flex");
    const focusTarget = calendarModal.querySelector("button:not([data-close-calendar-modal])");
    if (focusTarget) focusTarget.focus();
  }

  function closeCalendarModal() {
    if (!calendarModal) return;
    calendarModal.classList.remove("flex");
    calendarModal.classList.add("hidden");
  }

  calendarTriggers.forEach((btn) => btn.addEventListener("click", openCalendarModal));
  calendarCloseButtons.forEach((btn) => btn.addEventListener("click", closeCalendarModal));

  if (calendarModal) {
    calendarModal.addEventListener("click", (event) => {
      if (event.target === calendarModal) closeCalendarModal();
    });
  }

  // clear dates
  const clearBtn = document.getElementById("clear-dates");
  if (clearBtn) clearBtn.onclick = () => {
    window.selectedStart = null;
    window.selectedEnd = null;
    window._booking.setDatesLabel(null, null);
    document.querySelectorAll(".day").forEach((d) =>
      d.classList.remove("bg-brand/10", "bg-brand", "text-white", "text-brand")
    );
  };

  // modal controls
  const book = document.getElementById("book-now");
  const modal = document.getElementById("booking-modal");
  const modalSummary = document.getElementById("booking-modal-summary");
  const modalStatus = document.getElementById("booking-form-status");
  const bookingForm = document.getElementById("booking-form");
  const submitBtn = document.getElementById("booking-submit");
  const firstNameInput = document.getElementById("booking-first-name");
  const closeButtons = document.querySelectorAll("[data-close-booking-modal]");

  function openModal() {
    if (!modal) return;
    modal.classList.remove("hidden", "opacity-0");
    modal.classList.add("flex");
    if (firstNameInput) firstNameInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    if (bookingForm) bookingForm.reset();
    if (modalStatus) {
      modalStatus.textContent = "";
      modalStatus.classList.remove("text-green-600", "text-red-600");
    }
  }

  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  }

  if (book) {
    book.onclick = () => {
      closeCalendarModal();
      const arrival = window.selectedStart;
      const departure = window.selectedEnd;
      if (!arrival || !departure) {
        alert("Please select arrival and departure dates.");
        return;
      }
      if (!listingId) {
        alert("Missing listing id.");
        return;
      }

      if (modalSummary) {
        modalSummary.textContent = `Booking ${arrival} to ${departure} for ${guests} guest${guests > 1 ? "s" : ""}.`;
      }

      openModal();
    };
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const arrival = window.selectedStart;
      const departure = window.selectedEnd;
      if (!arrival || !departure) {
        alert("Please select arrival and departure dates.");
        closeModal();
        return;
      }
      if (!listingId) {
        alert("Missing listing id.");
        closeModal();
        return;
      }

      const formData = new FormData(bookingForm);
      const payload = {
        listingId,
        checkIn: arrival,
        checkOut: departure,
        numberOfGuests: guests,
        guestFirstName: formData.get("firstName") || "",
        guestLastName: formData.get("lastName") || "",
        guestEmail: formData.get("email") || "",
        guestPhone: formData.get("phone") || "",
        notes: formData.get("notes") || "",
        channelId: 0,
        channel: "Website",
        status: "new"
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      if (modalStatus) {
        modalStatus.textContent = "";
        modalStatus.classList.remove("text-green-600", "text-red-600");
      }

      try {
        const response = await fetch("https://living-water-backend.onrender.com/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.result) {
          modalStatus.textContent = "Reservation received! We'll be in touch shortly.";
          modalStatus.classList.add("text-green-600");
          setTimeout(closeModal, 1200);
        } else {
          const message = data?.error || "Could not create reservation. Please try again or use Send inquiry.";
          modalStatus.textContent = message;
          modalStatus.classList.add("text-red-600");
        }
      } catch (error) {
        console.error(error);
        modalStatus.textContent = "Network error. Please try again later or contact us directly.";
        modalStatus.classList.add("text-red-600");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit booking request";
        }
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeCalendarModal();
    }
  });
})();
