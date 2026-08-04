exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { visitorId, sessionId, contactPerson, email, phone } = JSON.parse(event.body);

  try {
    const crmRes = await fetch(`${process.env.CRM_WIT_DOMAIN}/api/wit/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: process.env.CRM_WIT_TRACKING_ID,
        apiSecret: process.env.CRM_WIT_SECRET,
        visitorId, sessionId, contactPerson, email, phone,
      }),
    });

    return {
      statusCode: crmRes.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: crmRes.ok }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Could not reach CRM' }),
    };
  }
};
