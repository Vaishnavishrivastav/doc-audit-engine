function getApiUrl(endpoint) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

export async function createCheckoutSession(fileName) {
  const url = getApiUrl('/api/create-checkout-session');
  
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });
  } catch (err) {
    throw new Error(`Cannot connect to backend server at ${url}. Please check if the server is running and accessible.`);
  }

  if (!response.ok) {
    let errData;
    try { errData = await response.json(); } catch (e) {}
    throw new Error(errData?.error || `Failed to create checkout session (HTTP ${response.status})`);
  }

  return response.json();
}

export async function analyzeInvoice(file, stripeSessionId) {
  const url = getApiUrl(`/api/analyze-invoice?stripe_session_id=${stripeSessionId}`);
  
  const formData = new FormData();
  formData.append('invoice', file);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(`Cannot connect to backend server at ${url}. Please check your connection.`);
  }

  if (!response.ok) {
    let errData;
    try { errData = await response.json(); } catch (e) {}
    throw new Error(errData?.error || `Failed to analyze invoice (HTTP ${response.status})`);
  }

  return response.json();
}
