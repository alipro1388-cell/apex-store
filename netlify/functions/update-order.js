const { getStore } = require("@netlify/blobs");

// لازم تكون نفس كلمة السر الموجودة بملف get-orders.js
const ADMIN_PASSWORD = "apex2026";

exports.handler = async (event) => {
  const pass = event.headers["x-admin-password"];
  if (pass !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "كلمة السر غلط" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { id, status } = JSON.parse(event.body);
    if (!id || !status) {
      return { statusCode: 400, body: JSON.stringify({ error: "بيانات ناقصة" }) };
    }

    const store = getStore({name: "orders", siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN});
    const order = await store.get(id, { type: "json" });
    if (!order) {
      return { statusCode: 404, body: JSON.stringify({ error: "الطلب غير موجود" }) };
    }

    order.status = status;
    await store.setJSON(id, order);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
