(function () {
  const listingId = window.LISTING_ID ? Number(window.LISTING_ID) : null;
  let guests = 1;

  // expose hooks used by the calendar widget
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

  // open calendar button - scroll into view
  const openBtn = document.getElementById("open-calendar");
  if (openBtn) openBtn.onclick = () => {
    const calendarSection = document.getElementById("availability");
    if (calendarSection) {
      calendarSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // book now
  const book = document.getElementById("book-now");
  if (book) book.onclick = async () => {
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

    try {
      const payload = {
        listingId,
        arrivalDate: arrival,
        departureDate: departure,
        guest: {
          firstName: "Website",
          lastName: "Guest",
          email: "guest@example.com",
          numberOfGuests: guests
        }
      };
      const r = await fetch("https://living-water-backend.onrender.com/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (data.result?.id) alert("Reservation created. We will email you shortly.");
      else {
        console.log("Reservation error:", data);
        alert("Could not create reservation. Please try again or use Send inquiry.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again later.");
    }
  };
})();
