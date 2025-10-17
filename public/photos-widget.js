app.get("/photos", async (req, res) => {
  try {
    const { listingId } = req.query;
    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    // get access token
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

    // fetch listing details
    const listingRes = await fetch(`https://api.hostaway.com/v1/listings/${listingId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const data = await listingRes.json();

    // normalize photos (CSV string → array)
    let photos = [];
    const pics = data.result?.pictures;
    if (typeof pics === "string") {
      photos = pics.split(",").map(p => p.trim()).filter(Boolean);
    } else if (Array.isArray(pics)) {
      photos = pics;
    }

    res.json({ photos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, photos: [] });
  }
});
