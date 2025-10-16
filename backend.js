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

app.get("/calendar", async (req, res) => {
  const { listingId, startDate, endDate } = req.query;

  // get access token
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

  const { access_token } = await tokenRes.json();

  // fetch calendar data
  const calRes = await fetch(
    `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  const calendar = await calRes.json();
  res.json(calendar);
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


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
