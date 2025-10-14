document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("photo-grid");
  const status = document.getElementById("photo-status");

  // Simulate loading delay
  setTimeout(() => {
    status.textContent = "Photos loaded successfully";

    // Demo photo URLs (replace with Hostaway API results later)
    const demoPhotos = [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500"
    ];

    demoPhotos.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Property photo";
      img.style.width = "100%";
      img.style.height = "150px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "10px";
      img.style.transition = "transform 0.2s ease";

      img.onmouseover = () => (img.style.transform = "scale(1.05)");
      img.onmouseout = () => (img.style.transform = "scale(1)");

      grid.appendChild(img);
    });
  }, 800);
});
