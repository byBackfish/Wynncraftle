import { NextResponse } from 'next/server';
import { GameModes } from '@/app/lib/mode';
import { Item } from '@/app/lib/struct';

import { getItemsFromCache } from '@/app/lib/cache';

async function getAllItems(): Promise<Item[]> {
  try {
    // Try to get items from cache first
    const cachedItems = await getItemsFromCache();
    if (cachedItems) {
      return cachedItems;
    }

    // If cache is not available, fallback to API call
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/items`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch items: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { seed, mode } = await request.json();

    // Validate input
    if (!seed || !mode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const gameMode = GameModes.find((m) => m.id === mode);
    if (!gameMode) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    // Get all items and filter based on game mode
    const allItems = await getAllItems();
    const validItems = allItems.filter((item) => gameMode.itemFilter(item));

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid items found for game mode' },
        { status: 404 }
      );
    }

    // Use the seed to deterministically select an item
    const index = seed % validItems.length;
    const selectedItem = validItems[index];

    return NextResponse.json(selectedItem);
  } catch (error) {
    console.error('Error in daily API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
