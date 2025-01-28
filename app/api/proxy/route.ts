export async function GET(req: any) {
  const url = 'https://api.wynncraft.com/v3/item/database?fullResult';

  try {
    // Fetch data from the external API
    const response = await fetch(url);
    const data = await response.json();

    // Return the data with proper CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch data',
      }),
      {
        status: error.response?.status || 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
