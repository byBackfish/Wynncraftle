// Game item types
export interface BaseItem {
  name: string;
}

export interface Weapon extends BaseItem {
  rarity: string;
  type: string;
  level: number;
  powderSlots: number;
  averageDPS: number;
}

export interface Gear extends BaseItem {
  rarity: string;
  type: string;
  level: number;
  powderSlots: number;
  health: number;
}

export interface Ingredient extends BaseItem {
  tier: number;
  type: string;
  level: number;
}

const ITEMS_URL = '/api/proxy';

let cachedItems: BaseItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function fetchItems(): Promise<BaseItem[]> {
  const now = Date.now();
  if (cachedItems && now - lastFetchTime < CACHE_DURATION) {
    return cachedItems;
  }

  try {
    const response = await fetch(ITEMS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    const itemsRecord = data || {};
    console.log('Items Record:', itemsRecord);
    cachedItems = Object.entries(itemsRecord).map(([name, item]) => {
      return {
        name,
        ...(item as any),
      };
    });
    lastFetchTime = now;
    return cachedItems;
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export function filterWeapons(items: BaseItem[]): Weapon[] {
  return items
    .filter((item: any) => {
      return item.type && item.type.toLowerCase() === 'weapon';
    })
    .map((item: any) => ({
      name: item.name,
      rarity: item.rarity || 'NORMAL',
      type: item.weaponType,
      level: item.requirements?.level || 1,
      powderSlots: item.powderSlots || 0,
      averageDPS: item.averageDps || 0,
    })) as Weapon[];
}

export function filterGear(items: BaseItem[]): Gear[] {
  return items
    .filter((item: any) => {
      return item.type && item.type.toLowerCase() === 'armour';
    })
    .map((item: any) => ({
      name: item.name,
      rarity: item.rarity || 'NORMAL',
      type: item.armourType,
      level: item.requirements?.level || 1,
      powderSlots: item.powderSlots || 0,
      health: item.base?.baseHealth || 0,
    })) as Gear[];
}

export function filterIngredients(items: BaseItem[]): Ingredient[] {
  return items
    .filter((item: any) => {
      return item.type && item.type.toLowerCase() === 'ingredient';
    })
    .map((item: any) => ({
      name: item.name,
      tier: item.tier || 1,
      type: item.requirements?.skills?.[0] || 'NONE',
      level: item.requirements?.level || 1,
    })) as Ingredient[];
}

// Daily item selection utilities
export async function getDailyItem(
  mode: string,
  date: Date = new Date()
): Promise<BaseItem> {
  const items = await fetchItems();
  const seed =
    date.getFullYear() * 10002 + (date.getMonth() + 1) * 100 + date.getDate();

  let filteredItems: BaseItem[];
  switch (mode) {
    case 'weapons':
      filteredItems = filterWeapons(items);
      break;
    case 'gear':
      filteredItems = filterGear(items);
      break;
    case 'ingredients':
      filteredItems = filterIngredients(items);
      break;
    default:
      throw new Error(`Invalid game mode: ${mode}`);
  }

  if (filteredItems.length === 0) {
    throw new Error(`No items found for mode: ${mode}`);
  }

  return filteredItems[seed % filteredItems.length];
}

export async function getItemForDate(
  mode: string,
  date: Date
): Promise<BaseItem> {
  return getDailyItem(mode, date);
}
