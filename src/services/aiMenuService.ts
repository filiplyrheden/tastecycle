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
Du får en veckomeny (JSON) och en lista med "selected_ids".
Skapa ENDAST ersättningar för rätterna med dessa id:n.

MÅL
- Ersättningen ska KOMPLETTERA den existerande menyn.
- Behåll cirka samma komplexitet som originalrätten: ungefär samma antal ingredienser (+/-2) och ungefär samma antal steg (+/-1).
- Behåll ungefär samma tidsnivå (snabb/medel/längre) om det framgår av instruktionerna.
- Respektera kostrestriktioner som följer av originalrätten (t.ex. om den var vegetarisk/glutenfri ska ersättningen också vara det).
- Öka veckans variation jämfört med originalrätten och menyn i stort: variera gärna kök/region, huvudprotein, tillagningssätt (stek/ugn/kok), serveringssätt (gryta, macka, sallad, bowl, wraps), och smakprofil (syrligt, kryddigt, umami, fräscht).

HÅRDA ANTIDUPLIKAT-REGLER (VETO)
För varje ersättning – jämfört med rätten den ersätter och resten av veckan:
- Titeln får inte innehålla samma basrätt/familj (t.ex. pannkakor/crepes/wafflor, köttfärssås/bolognese/lasagne, tacos/tortillas/quesadillas) eller samma huvudordstam.
- Delmängdslikhet mellan ingredienslistor ska vara låg: max ~35% överlapp i unika råvaror (t.ex. räknat utan basvaror som salt/peppar/olja/vatten).
- Byt gärna tillagningssätt ELLER huvudprotein/källa (t.ex. från stekpanna till ugn, från mjölbas till ris/potatis, från kyckling till baljväxter) om menyn redan har många liknande rätter.
- Återanvänd inte titelns nyckelord; undvik “glutenfri”, “blåbärs-”, “extra”, “klassisk” som enda skillnad.

FORMATKRAV
Returnera ENDAST giltig JSON:
{
  "replacements": [
    { "old_id": "ID1", "title": "Ny titel", "ingredients": ["..."], "instructions": ["Steg 1", "Steg 2", "..."] },
    ...
  ]
}

INSTRUKTIONER FÖR ARBETSGÅNG (TYST ANALYS)
1) Sammanfatta menyn för dig själv: lista kök/region, huvudprotein, tillagningssätt, tidsnivå, samt rätternas ingrediens- och steglängd.
2) För varje selected_id: identifiera originalrättens komplexitet (ingredienser/steg), tidsnivå och kostrestriktioner.
3) Föreslå en rätt som:
   - matchar komplexitet och ungefärlig längd/tidsnivå,
   - ökar variation mot originalet och mot veckans övriga rätter,
   - håller sig borta från förbjudna likheter (se VETO),
   - använder vardagliga ingredienser som är rimliga i Sverige.
4) Kontrollera titeln: den ska vara tydlig och inte avslöja att det är en variant av samma basrätt.
5) Skriv endast JSON enligt schema, utan extra text.

Detaljer för listorna:
- "ingredients": 5–12 rader per rätt (om originalet hade färre eller fler, håll dig inom +/-2).
- "instructions": koncisa, numrerade steg (ca 3–8, håll dig inom +/-1 mot originalet).
- Använd svensk matterminologi (t.ex. “fräs”, “sjud”, “ugnsbaka”).

Återkom ENDAST med JSON enligt schema ovan.
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          "Du är en smart köksassistent.",
          "TÄNK STEGVIS TYST (utan att skriva ut resonemanget) och returnera ENDAST giltig JSON enligt användarens schema.",
          "Skriv på svenska. Använd metriska mått och vardagliga ingrediensnamn.",
          "Inga kodblock, inga kommentarer, ingen förklaring – endast JSON.",
        ].join("\n"),
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

  const repByOldId: Record<string, Replacement> = {};
  for (const rep of replacements) {
    repByOldId[rep.old_id] = rep;
  }

  const mapping: Record<
    string,
    { id: string; title: string; ingredients: string[]; instructions: string[] }
  > = {};

  for (const rep of replacements) {
    if (!selectedIds.includes(rep.old_id)) continue;

    const draft: RecipeDraft = {
      user_id: menu.user_id,
      title: rep.title,
      ingredients: rep.ingredients ?? [],
      instructions: rep.instructions ?? [],
    };

    const created = await createRecipe(draft);

    mapping[rep.old_id] = {
      id: created.id,
      title: created.title,
      ingredients: draft.ingredients ?? [],
      instructions: draft.instructions ?? [],
    };
  }

  const updated: WeeklyMenuJSON = {
    ...menu,
    days: menu.days.map((d) => {
      const m = mapping[d.id];
      return m
        ? {
            ...d,
            id: m.id,
            title: m.title,
            ingredients: m.ingredients,
            instructions: m.instructions,
          }
        : d;
    }),
  };

  await saveWeeklyMenuLocal(updated);
  return updated;
}
