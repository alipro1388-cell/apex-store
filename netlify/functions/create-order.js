const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.name || !data.phone || !data.address || !Array.isArray(data.items) || data.items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "بيانات الطلب ناقصة" }) };
    }

    const store = getStore({name: "orders", siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN})
    const id = "ORD-" + Date.now();

    const order = {
      id,
      createdAt: new Date().toISOString(),
      status: "جديد",
      customer: {
        name: data.name,
        phone: data.phone,
        city: data.city || "",
        address: data.address,
      },
      items: data.items,
      total: data.total || 0,
      payment: data.payment || "الدفع عند الاستلام",
    };

    await store.setJSON(id, order);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, orderId: id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
