document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("rating-list");
  const status = document.getElementById("rating-status");

  // Simulate API loading delay
  setTimeout(() => {
    status.textContent = "Latest guest reviews";

    // Demo rating data (replace with Hostaway API data later)
    const demoRatings = [
      { name: "Alexandra", rating: 5, text: "Amazing apartment, very clean and cozy!" },
      { name: "John", rating: 4, text: "Great stay overall. Location was perfect." },
      { name: "Maria", rating: 5, text: "Hosts were super friendly. Would book again!" },
      { name: "Daniel", rating: 3, text: "Nice space, but the Wi-Fi could be better." }
    ];

    demoRatings.forEach((review) => {
      const card = document.createElement("div");
      card.style.border = "1px solid #ddd";
      card.style.borderRadius = "10px";
      card.style.padding = "15px";
      card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
      card.style.textAlign = "left";

      const name = document.createElement("h4");
      name.textContent = review.name;
      name.style.margin = "0 0 6px 0";

      const stars = document.createElement("div");
      stars.style.color = "#FFD700";
      stars.style.marginBottom = "8px";
      stars.style.fontSize = "18px";
      stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

      const text = document.createElement("p");
      text.textContent = review.text;
      text.style.margin = 0;
      text.style.color = "#555";

      card.appendChild(name);
      card.appendChild(stars);
      card.appendChild(text);
      container.appendChild(card);
    });
  }, 800);
});
