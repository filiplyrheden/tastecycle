import OpenAI from "openai";
import {
  readWeeklyMenuLocal,
  saveWeeklyMenuLocal,
  WeeklyMenuJSON,
} from "../utils/menuStorage";

const client = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_KEY });

export async function replaceRecipesWithAI(selectedIds: string[]) {
  const menu = await readWeeklyMenuLocal();
  if (!menu) throw new Error("Ingen meny hittad");

  const prompt = `
Du är en smart köksassistent.
Du får veckomenyn i JSON och ska byta ut rätterna vars id finns i "selected_ids" mot nya recept.
Behåll struktur, portioner och kostrestriktioner. Returnera endast giltig JSON i samma format.

selected_ids: ${JSON.stringify(selectedIds)}
  `;

  const response = await client.responses.create({
    model: "gpt-4.1-mini", // eller "gpt-4.1" / "gpt-5"
    input: [
      {
        role: "system",
        content: "Returnera endast giltig JSON utan extra text.",
      },
      { role: "user", content: prompt },
      { role: "user", content: JSON.stringify(menu) },
    ],
  });

  let jsonText = response.output_text ?? "";

  // Rensa bort eventuella markdown-block eller icke-JSON-tecken
  jsonText = jsonText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Försök tolka JSON
  let newMenu: WeeklyMenuJSON;
  try {
    newMenu = JSON.parse(jsonText);
  } catch (e) {
    console.error("❌ Kunde inte parsa JSON:", jsonText);
    throw e;
  }

  await saveWeeklyMenuLocal(newMenu);
  return newMenu;
}
