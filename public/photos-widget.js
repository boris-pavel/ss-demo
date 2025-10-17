app.get("/photos", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    // 1. Get access token
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

    // 2. Fetch listing details (collection endpoint gives more info)
    const resp = await fetch(
      `https://api.hostaway.com/v1/listings?id=${listingId}&limit=1`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await resp.json();
    const listing = Array.isArray(data.result) ? data.result[0] : data.result;

    // 3. Normalize all possible photo fields
    let photos = [];
    if (listing) {
      const add = (v) => {
        if (!v) return;
        if (Array.isArray(v)) photos.push(...v);
        else if (typeof v === "string") {
          v.split(",").map(s => s.trim()).forEach(s => {
            if (s && /^https?:\/\//.test(s)) photos.push(s);
          });
        }
      };
      add(listing.gallery);
      add(listing.pictures);
      add(listing.pictureLarge);
      add(listing.pictureSmall);
    }

    // Remove duplicates
    photos = [...new Set(photos)];
    res.json({ photos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, photos: [] });
  }
});
