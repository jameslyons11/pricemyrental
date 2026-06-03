// Vercel Serverless Function — proxies Rentcast API
// Your RENTCAST_API_KEY lives in Vercel environment variables, never in the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, bedrooms, bathrooms, propertyType, squareFootage } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const params = new URLSearchParams({ address, compCount: '10' });
  if (bedrooms !== undefined && bedrooms !== '')   params.append('bedrooms', bedrooms);
  if (bathrooms !== undefined && bathrooms !== '') params.append('bathrooms', bathrooms);
  if (propertyType && propertyType !== '')         params.append('propertyType', propertyType);
  if (squareFootage && squareFootage !== '')       params.append('squareFootage', squareFootage);

  try {
    const response = await fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?${params.toString()}`,
      {
        headers: {
          'X-Api-Key': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Rentcast API error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Rentcast fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch rental data' });
  }
}
