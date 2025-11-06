import AsyncStorage from "@react-native-async-storage/async-storage";
import { readWeeklyMenuLocal } from "./menuStorage";

export type ShoppingItem = {
  id: string;
  name: string;
  checked: boolean;
};

function normalizeKey(s: string) {
  return s
    .replace(/\(.*?\)/g, "")
    .replace(/[•\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toDisplayName(key: string) {
  if (!key) return key;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

const STORAGE_KEY = "tastecycle.shoppinglist.checked.v1";

export async function buildShoppingList(
  selectedIds?: string[]
): Promise<ShoppingItem[]> {
  const menu = await readWeeklyMenuLocal();
  if (!menu?.days?.length) return [];

  const days = menu.days.slice(0, 5);
  const filtered = selectedIds?.length
    ? days.filter((d: any) => selectedIds.includes(d.id))
    : days;

  const bag = new Map<string, string>();
  for (const d of filtered) {
    const list: string[] = Array.isArray(d.ingredients)
      ? d.ingredients
      : d.ingredients
      ? [d.ingredients]
      : [];

    for (const raw of list) {
      if (!raw) continue;
      const chunks = String(raw)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      for (const c of chunks) {
        const key = normalizeKey(c);
        if (!key) continue;
        bag.set(key, toDisplayName(key));
      }
    }
  }

  const savedRaw = await AsyncStorage.getItem(STORAGE_KEY);
  const saved: Record<string, boolean> = savedRaw ? JSON.parse(savedRaw) : {};

  const items: ShoppingItem[] = Array.from(bag.entries())
    .map(([key, display]) => ({
      id: key,
      name: display,
      checked: !!saved[key],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  return items;
}

export async function setItemChecked(id: string, checked: boolean) {
  const savedRaw = await AsyncStorage.getItem(STORAGE_KEY);
  const saved: Record<string, boolean> = savedRaw ? JSON.parse(savedRaw) : {};
  saved[id] = checked;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export async function setAllChecked(ids: string[], checked: boolean) {
  const savedRaw = await AsyncStorage.getItem(STORAGE_KEY);
  const saved: Record<string, boolean> = savedRaw ? JSON.parse(savedRaw) : {};
  for (const id of ids) saved[id] = checked;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export async function clearChecked() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
