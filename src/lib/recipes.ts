import { supabase } from "./supabase";

supabase;

type Ingredient = string; // eller { amount: string; item: string }
type RecipeInput = {
  title: string;
  ingredients: Ingredient[];
  instructions: string;
};

export async function createRecipe(data: RecipeInput) {
  const { data: user } = await supabase.auth.getUser();
  const user_id = user.user?.id;

  const { data: inserted, error } = await supabase
    .from("recipes")
    .insert([{ ...data, user_id }])
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function listMyRecipes(search?: string) {
  let q = supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (search && search.trim()) {
    q = q.ilike("title", `%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getRecipe(id: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateRecipe(id: string, patch: Partial<RecipeInput>) {
  const { data, error } = await supabase
    .from("recipes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
