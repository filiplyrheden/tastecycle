import { supabase } from "./supabase";

export async function testRead() {
  const { data, error } = await supabase.from("Test").select("*").limit(5);
  if (error) throw error;
  console.log("Supabase OK, data:", data);
  return data;
}

export async function testWrite() {
  const { data, error } = await supabase
    .from("Test")
    .insert({ title: "Hello from Expo", created_at: new Date().toISOString() })
    .select();
  if (error) throw error;
  console.log("Insert OK:", data);
  return data;
}
