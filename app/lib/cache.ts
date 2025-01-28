import fs from 'fs';
import path from 'path';
import { Item } from './struct';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const ITEMS_CACHE_FILE = path.join(CACHE_DIR, 'items.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData {
  items: Item[];
  lastUpdated: number;
}

export async function getItemsFromCache(): Promise<Item[] | null> {
  try {
    if (!fs.existsSync(ITEMS_CACHE_FILE)) {
      return null;
    }

    const cacheContent = fs.readFileSync(ITEMS_CACHE_FILE, 'utf-8');
    const cacheData: CacheData = JSON.parse(cacheContent);

    // Check if cache is expired
    if (Date.now() - cacheData.lastUpdated > CACHE_TTL) {
      return null;
    }

    return cacheData.items;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export async function updateItemsCache(items: Item[]): Promise<void> {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const cacheData: CacheData = {
      items,
      lastUpdated: Date.now(),
    };

    fs.writeFileSync(ITEMS_CACHE_FILE, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}
