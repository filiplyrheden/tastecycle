import { supabase } from "../lib/supabase";

export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  ingredients?: string | string[] | null;
  instructions?: string | string[] | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  next_menu_index: number;
};
async function getRecipeCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, next_menu_index")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

async function setNextMenuIndex(userId: string, nextIndex: number) {
  const { error } = await supabase
    .from("profiles")
    .update({ next_menu_index: nextIndex })
    .eq("id", userId);
  if (error) throw error;
}

async function fetchRange(
  userId: string,
  start: number,
  endInclusive: number
): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .range(start, endInclusive);

  if (error) throw error;
  return (data ?? []) as Recipe[];
}

export async function getNextFiveRecipes(userId: string): Promise<{
  items: Recipe[];
  count: number;
  startIndex: number;
  nextIndex: number;
}> {
  const count = await getRecipeCount(userId);
  if (count <= 0) {
    return { items: [], count: 0, startIndex: 0, nextIndex: 0 };
  }

  const profile = await getProfile(userId);
  const startIndex = (((profile.next_menu_index ?? 0) % count) + count) % count; // säker modulo

  const firstBatchLen = Math.min(5, count - startIndex);
  let items = await fetchRange(
    userId,
    startIndex,
    startIndex + firstBatchLen - 1
  );

  if (items.length < 5 && count > items.length) {
    const remaining = 5 - items.length;
    const part2 = await fetchRange(userId, 0, remaining - 1);
    items = items.concat(part2);
  }

  const step = Math.min(5, count);
  const nextIndex = (startIndex + step) % count;

  return { items, count, startIndex, nextIndex };
}

export async function advanceMenuIndex(userId: string, step: number) {
  const count = await getRecipeCount(userId);
  if (count <= 0) {
    return;
  }

  const profile = await getProfile(userId);
  const current = (((profile.next_menu_index ?? 0) % count) + count) % count;
  const next = (current + Math.min(step, count)) % count;

  await setNextMenuIndex(userId, next);
}

export async function generateWeeklyMenu(userId: string): Promise<Recipe[]> {
  const { items } = await getNextFiveRecipes(userId);
  await advanceMenuIndex(userId, items.length || 0);
  return items;
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Recipe;
}

export function parseListField(field?: unknown): string[] {
  if (!field) return [];

  if (Array.isArray(field)) {
    return field.map((s) => String(s).trim()).filter(Boolean);
  }

  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}

    return field
      .split(/\r?\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

export type RecipeDraft = {
  user_id: string;
  title: string;
  ingredients?: string[];
  instructions?: string[];
};

export async function createRecipe(draft: RecipeDraft): Promise<Recipe> {
  const ingredientsStr =
    draft.ingredients && draft.ingredients.length
      ? draft.ingredients.join("\n")
      : null;

  const instructionsStr =
    draft.instructions && draft.instructions.length
      ? draft.instructions.join("\n")
      : null;

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: draft.user_id,
      title: draft.title,
      ingredients: ingredientsStr,
      instructions: instructionsStr,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Recipe;
}
