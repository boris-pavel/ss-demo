import express from "express";
import fetch from "node-fetch";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
const PORT = 3000;

// replace with your credentials (keep them secret here)
const CLIENT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const CLIENT_SECRET = process.env.HOSTAWAY_SECRET;

app.get("/availability", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId required" });

    // 1️⃣ Get access token
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

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("Failed to get access token");

    // 2️⃣ Define date range
    const today = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    const startDate = today.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    // 3️⃣ Request calendar data
    const apiUrl = `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`;
    const apiRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await apiRes.json();

    // 4️⃣ Normalize format
    const result = {};
    if (Array.isArray(data.result)) {
      data.result.forEach((d) => {
        result[d.date] = {
          available: d.isAvailable === 1,
          price: d.price || null,
        };
      });
    }

    res.json({ result });
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ error: err.message });
  }
});



app.get("/reviews", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) {
      return res.status(400).json({ error: "listingId required" });
    }

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
    const { access_token: accessToken } = await tokenRes.json();
    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    // 2. Fetch all reviews with pagination
    const limit = 100;
    let offset = 0;
    const aggregated = [];
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        listingId: String(listingId),
        limit: String(limit),
        offset: String(offset),
      });

      const revRes = await fetch(
        `https://api.hostaway.com/v1/reviews?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!revRes.ok) {
        const errorPayload = await revRes.text();
        throw new Error(
          `Hostaway reviews request failed (${revRes.status}): ${errorPayload}`
        );
      }

      const json = await revRes.json();
      const batch = Array.isArray(json.result) ? json.result : [];
      aggregated.push(...batch);

      if (batch.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    const filtered = aggregated
      .filter((item) => Number(item?.rating ?? 0) > 0)
      .sort((a, b) => {
        const dateA = new Date(a?.submittedAt || a?.createdAt || 0);
        const dateB = new Date(b?.submittedAt || b?.createdAt || 0);
        return dateB - dateA;
      });

    res.json({
      status: "success",
      count: filtered.length,
      result: filtered,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: error.message });
  }
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

// GET /amenities?listingId=97521
app.get("/amenities", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId required" });

    // 1️⃣ Reuse the same Hostaway auth flow
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

    // 2️⃣ Fetch all listings (like your /listings-debug endpoint)
    const listRes = await fetch(
      "https://api.hostaway.com/v1/listings?limit=200",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const data = await listRes.json();
    const listings = data.result || [];

    // 3️⃣ Find the specific listing
    const listing = listings.find(
      (l) => String(l.id) === String(listingId)
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // 4️⃣ Extract amenities correctly
    const amenities =
      listing.listingAmenities?.map((a) => a.amenityName) || [];

    res.json({ amenities });
  } catch (err) {
    console.error("Error fetching amenities:", err);
    res.status(500).json({ error: err.message });
  }
});




app.post("/booking", async (req, res) => {
  try {
    const {
      listingId,
      arrivalDate,
      departureDate,
      guest = {},
      message,
    } = req.body || {};

    if (!listingId) {
      return res.status(400).json({ error: "listingId required" });
    }

    if (!arrivalDate || !departureDate) {
      return res
        .status(400)
        .json({ error: "arrivalDate and departureDate required" });
    }

    const {
      firstName = "",
      lastName = "",
      email = "",
      phone = "",
      numberOfGuests = 1,
      notes = "",
    } = guest;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "guest.firstName, guest.lastName and guest.email are required",
      });
    }

    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "general",
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Failed to obtain access token (${tokenRes.status}): ${text}`);
    }

    const { access_token: accessToken } = await tokenRes.json();
    if (!accessToken) throw new Error("Invalid Hostaway access token response");

    const reservationPayload = {
      listingId,
      checkIn: arrivalDate,
      checkOut: departureDate,
      numberOfGuests,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestEmail: email,
      guestPhone: phone,
      notes: notes || message || "",
      channel: "Website",
      status: "new",
    };

    const reservationRes = await fetch("https://api.hostaway.com/v1/reservations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationPayload),
    });

    const reservationData = await reservationRes.json();

    if (!reservationRes.ok) {
      const text = await reservationRes.text();
      console.error("Reservation error payload:", text);

      throw new Error(
        reservationData?.error ||
          `Hostaway reservation request failed (${reservationRes.status})`
      );
    }

    res.status(201).json({ result: reservationData });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

