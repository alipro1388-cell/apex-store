const { getStore } = require("@netlify/blobs");

// غيّر كلمة السر هذي لشي خاص فيك — نفسها لازم تنكتب بصفحة admin.html
const ADMIN_PASSWORD = "apex2026";

exports.handler = async (event) => {
  const pass = event.headers["x-admin-password"];
  if (pass !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "كلمة السر غلط" }) };
  }

  try {
  const store =  getStore({name: "orders", siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN});
    const { blobs } = await store.list();

    const orders = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: "json" }))
    );

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
