import { File, Directory, Paths } from "expo-file-system";

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export type WeeklyMenuJSON = {
  week: string;
  user_id: string;
  days: Array<{
    day: DayKey;
    id: string;
    title: string;
    ingredients?: string[] | null;
    servings?: number | null;
  }>;
  constraints?: {
    vegetarian_days?: DayKey[];
    gluten_free?: boolean;
    budget_per_meal_sek?: number;
  };
};

// --- Hjälpfunktioner ---
function getISOWeekKey(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function toWeeklyMenuJSON(
  recipes: Array<{
    id: string;
    title: string;
    ingredients?: string[] | null;
    servings?: number | null;
  }>,
  userId: string,
  opts?: { week?: string; constraints?: WeeklyMenuJSON["constraints"] }
): WeeklyMenuJSON {
  const week = opts?.week ?? getISOWeekKey();
  const days = DAYS.map((day, i) => {
    const r = recipes[i];
    return {
      day,
      id: r?.id ?? `empty-${i}`,
      title: r?.title ?? "",
      ingredients: r?.ingredients ?? [],
      servings: r?.servings ?? null,
    };
  });
  return { week, user_id: userId, days, constraints: opts?.constraints };
}

// --- Nya FileSystem-funktioner (SDK 54+) ---
export async function saveWeeklyMenuLocal(menu: WeeklyMenuJSON) {
  const dir = new Directory(Paths.document, "menus");
  const file = new File(dir, `${menu.week}.json`);

  // Skapa mapp om den inte finns
  if (!dir.exists) dir.create();

  // Skapa fil om den inte finns
  if (!file.exists) file.create();

  // Skriv JSON till filen
  file.write(JSON.stringify(menu, null, 2));

  return file.uri; // ex: file:///.../Documents/menus/2025-W44.json
}

export async function readWeeklyMenuLocal(week?: string) {
  const w = week ?? getISOWeekKey();
  const dir = new Directory(Paths.document, "menus");
  const file = new File(dir, `${w}.json`);

  if (!file.exists) return null;
  const raw = await file.text();
  return JSON.parse(raw) as WeeklyMenuJSON;
}
