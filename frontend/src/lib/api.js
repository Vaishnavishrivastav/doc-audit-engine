export async function createCheckoutSession(fileName) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function analyzeInvoice(file, stripeSessionId) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-invoice?stripe_session_id=${stripeSessionId}`;
  
  const formData = new FormData();
  formData.append('invoice', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze invoice');
  }

  return response.json();
}
