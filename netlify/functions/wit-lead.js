exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) };
  }

  const { visitorId, sessionId, companyName, contactPerson, email, phone, dealValue } = payload;

  if (!contactPerson) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'contactPerson is required' }),
    };
  }

  try {
    const crmRes = await fetch(`${process.env.CRM_WIT_DOMAIN}/api/wit/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackingId: process.env.CRM_WIT_TRACKING_ID,
        apiSecret: process.env.CRM_WIT_SECRET,
        visitorId,
        sessionId,
        companyName: companyName || contactPerson || 'Website Lead',
        contactPerson,
        email,
        phone,
        dealValue,
      }),
    });

    const crmBody = await crmRes.json().catch(() => null);

    return {
      statusCode: crmRes.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmBody ?? { success: crmRes.ok }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Could not reach CRM' }),
    };
  }
};
