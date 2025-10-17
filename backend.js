import express from "express";
import fetch from "node-fetch";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.static("public"));
const PORT = 3000;

// replace with your credentials (keep them secret here)
const CLIENT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const CLIENT_SECRET = process.env.HOSTAWAY_SECRET;

app.get("/availability", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId required" });

    // Get access token
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_SECRET,
        scope: "general",
      }),
    });
    const { access_token } = await tokenRes.json();

    //  Fetch availability from Hostaway API
    const today = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3); // fetch 3 months ahead
    const url = `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${today
      .toISOString()
      .split("T")[0]}&endDate=${end.toISOString().split("T")[0]}`;

    const apiRes = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const json = await apiRes.json();

    const result = {};
    json.result?.calendar?.forEach((day) => {
      result[day.date] = { available: day.available };
    });

    res.json({ result });
  } catch (e) {
    console.error("Error fetching availability:", e);
    res.status(500).json({ error: e.message });
  }
});



app.get("/reviews", async (req, res) => {
  const { listingId } = req.query;

  // 1. Get an access token
  const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.HOSTAWAY_ACCOUNT_ID,
      client_secret: process.env.HOSTAWAY_SECRET,
      scope: "general",
    }),
  });
  const { access_token } = await tokenRes.json();

  // 2. Get reviews
  const revRes = await fetch(
    `https://api.hostaway.com/v1/reviews?listingId=${listingId}&limit=10`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const reviews = await revRes.json();
  res.json(reviews);
});


app.get("/photos", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    //  Get access token
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_SECRET,
        scope: "general",
      }),
    });
    const { access_token } = await tokenRes.json();

    //  Get the listing details
    const listingRes = await fetch(
      `https://api.hostaway.com/v1/listings/${listingId}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const json = await listingRes.json();
    const listing = json.result;

    // Extract photos from listingImages
    const photos = (listing.listingImages || [])
      .filter(img => img.url && img.url.startsWith("https"))
      .map(img => ({
        url: img.url,
        caption: img.bookingEngineCaption || img.airbnbCaption || img.caption || "",
      }));

    res.json({ photos });
  } catch (err) {
    console.error("Error fetching photos:", err);
    res.status(500).json({ photos: [], error: err.message });
  }
});




app.get("/listings-debug", async (req, res) => {
  try {
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_SECRET,
        scope: "general",
      }),
    });
    const { access_token } = await tokenRes.json();

    const listRes = await fetch("https://api.hostaway.com/v1/listings?limit=50", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const json = await listRes.json();

    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
