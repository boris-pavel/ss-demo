(function () {
  const DEFAULT_LISTING_ID = "263677";

  const setListingId = (value) => {
    if (!value) return false;
    const normalized = String(value).trim();
    if (!normalized) return false;
    window.LISTING_ID = normalized;
    return true;
  };

  const getQueryListingId = () => {
    const params = new URLSearchParams(window.location.search);
    const keys = ["listingId", "listing_id", "id"];
    for (const key of keys) {
      const val = params.get(key);
      if (val && setListingId(val)) return true;
    }
    return false;
  };

  const getBodyDataListingId = () =>
    typeof document !== "undefined" &&
    document.body &&
    setListingId(document.body.dataset?.listingId);

  const getMetaListingId = () => {
    if (typeof document === "undefined") return false;
    const meta = document.querySelector('meta[name="listing-id"]');
    return meta ? setListingId(meta.content) : false;
  };

  const getPathListingId = () => {
    if (typeof window === "undefined") return false;
    const path = window.location.pathname.replace(/\/+$/, "") || "/";

    // Update these maps to support additional Squarespace collection URLs.
    const PATH_MAP = {
      "/": DEFAULT_LISTING_ID,
    };
    const SLUG_MAP = {
      // Example: "lakeside-retreat": "97521",
    };

    if (PATH_MAP[path] && setListingId(PATH_MAP[path])) return true;

    const slug = path.split("/").filter(Boolean).pop();
    if (slug && SLUG_MAP[slug] && setListingId(SLUG_MAP[slug])) return true;

    return false;
  };

  if (getQueryListingId()) return;
  if (getBodyDataListingId()) return;
  if (getMetaListingId()) return;
  if (getPathListingId()) return;

  if (!window.LISTING_ID) {
    window.LISTING_ID = DEFAULT_LISTING_ID;
  }
})();
