export interface RecentlyViewedItem {
  id: number;
  slug: string;
  name: string;
  thumbnail: string;
  viewedAt: number;
}

const STORAGE_KEY = 'neetstore_recently_viewed_v1';
const MAX_ITEMS = 8;

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is RecentlyViewedItem =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'number' &&
        typeof item.slug === 'string' &&
        item.slug.trim().length > 0 &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0
    );
  } catch (err) {
    console.error('Failed to read recently viewed from localStorage:', err);
    return [];
  }
}

export function addRecentlyViewed(item: {
  id: number;
  slug: string;
  name: string;
  thumbnail?: string | null;
  viewedAt?: number;
}): void {
  if (typeof window === 'undefined') return;
  if (!item || !item.slug || !item.name) return;

  try {
    const current = getRecentlyViewed();
    const newItem: RecentlyViewedItem = {
      id: item.id,
      slug: item.slug.trim(),
      name: item.name.trim(),
      thumbnail: item.thumbnail || '',
      viewedAt: item.viewedAt || Date.now(),
    };

    // Remove if already exists with same slug or id (deduplication)
    const filtered = current.filter(
      (i) => i.slug.toLowerCase() !== newItem.slug.toLowerCase() && i.id !== newItem.id
    );

    // Place new item at index 0 and cap to MAX_ITEMS
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch a custom event so other components or tabs in the same window update in real-time
    window.dispatchEvent(new Event('neetstore_recently_viewed_updated'));
  } catch (err) {
    console.error('Failed to save recently viewed to localStorage:', err);
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('neetstore_recently_viewed_updated'));
  } catch (err) {
    console.error('Failed to clear recently viewed from localStorage:', err);
  }
}
