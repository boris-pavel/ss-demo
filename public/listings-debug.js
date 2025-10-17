// GET /listings-debug  → helps you see ids and picture fields
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

    const listRes = await fetch(
      "https://api.hostaway.com/v1/listings?limit=200",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const json = await listRes.json();
    res.json(json); // open this in the browser to see each listing's id and picture fields
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
