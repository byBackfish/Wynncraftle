import { Item } from '@/app/lib/struct';
import { getItemsFromCache, updateItemsCache } from '@/app/lib/cache';

export async function GET(req: Request) {
  try {
    // Try to get items from cache first
    const cachedItems = await getItemsFromCache();
    if (cachedItems) {
      return new Response(JSON.stringify(cachedItems), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      });
    }

    // If no cache or expired, fetch from API
    const url = 'https://api.wynncraft.com/v3/item/database?fullResult';
    const response = await fetch(url);
    const data: Record<string, Item> = await response.json();
    const newData = Object.values(data);
    const items = Object.values(data);

    // Update cache with new data
    await updateItemsCache(items);

    return new Response(JSON.stringify(newData), {
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
