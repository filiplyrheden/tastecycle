import OpenAI from "openai";
import {
  readWeeklyMenuLocal,
  saveWeeklyMenuLocal,
  WeeklyMenuJSON,
} from "../utils/menuStorage";
import { createRecipe, type RecipeDraft } from "./recipesService";

const client = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_KEY });

type Replacement = {
  old_id: string;
  title: string;
  ingredients?: string[];
  instructions?: string[];
};

export async function replaceRecipesWithAI(selectedIds: string[]) {
  const menu = await readWeeklyMenuLocal();
  if (!menu) throw new Error("Ingen meny hittad");

  const prompt = `
Du är en smart köksassistent.
Du får en veckomeny (JSON) och en lista med recipe-id:n "selected_ids".
Skapa ENDAST ersättningar för dessa rätter.

Krav för varje ersättning:
- "old_id": id som ska ersättas (måste finnas i selected_ids)
- "title": ny recepttitel
- "ingredients": string[]
- "instructions": string[]

Returnera ENDAST giltig JSON med följande format:

{
  "replacements": [
    { "old_id": "ID1", "title": "...", "ingredients": ["..."], "instructions": ["..."] },
    ...
  ]
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "Returnera endast giltig JSON utan extra text.",
      },
      { role: "user", content: prompt },
      {
        role: "user",
        content: JSON.stringify({ menu, selected_ids: selectedIds }),
      },
    ],
  });

  let jsonText = response.output_text ?? "";
  jsonText = jsonText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed: { replacements: Replacement[] };
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    console.error("❌ Kunde inte parsa JSON:", jsonText);
    throw e;
  }

  const replacements = parsed?.replacements ?? [];
  if (!Array.isArray(replacements) || replacements.length === 0) {
    throw new Error("AI returnerade inga ersättningar.");
  }

  const mapping: Record<string, { id: string; title: string }> = {};

  for (const rep of replacements) {
    if (!selectedIds.includes(rep.old_id)) continue;

    const draft: RecipeDraft = {
      user_id: menu.user_id,
      title: rep.title,
      ingredients: rep.ingredients ?? [],
      instructions: rep.instructions ?? [],
    };

    const created = await createRecipe(draft);
    mapping[rep.old_id] = { id: created.id, title: created.title };
  }
  const updated: WeeklyMenuJSON = {
    ...menu,
    days: menu.days.map((d) => {
      const m = mapping[d.id];
      return m ? { ...d, id: m.id, title: m.title } : d;
    }),
  };

  await saveWeeklyMenuLocal(updated);
  return updated;
}
