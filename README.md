# TasteCycle

TasteCycle is a React Native app built with Expo that helps you plan a weekly menu from your personal recipe collection. It can generate a shopping list, rotate recipes weekly, and even replace selected dishes with AI-generated alternatives.

<p align="center">
<img width="1206" height="2622" alt="Simulator Screenshot - iPhone 17 Pro - 2025-11-17 at 10 00 07" src="https://github.com/user-attachments/assets/2a748c89-3a2b-443c-8165-ff4661f5736d" />
<img width="1206" height="2622" alt="Simulator Screenshot - iPhone 17 Pro - 2025-11-17 at 10 00 14" src="https://github.com/user-attachments/assets/523024ba-2c84-4b48-bfbc-08c8a118c328" />
<img width="1206" height="2622" alt="Simulator Screenshot - iPhone 17 Pro - 2025-11-17 at 10 00 26" src="https://github.com/user-attachments/assets/cc2be789-e4c7-4349-9e4f-32b8f09ab66d" />
</p>

## Features

- Email/password authentication (Supabase Auth)
- Personal recipe collection (create, edit, view)
- Weekly menu generator: selects five recipes and rotates them weekly
- AI-powered replacements using OpenAI’s Responses API
- One-tap shopping list generation from the current week’s menu
- Local persistence of the active weekly menu (via expo-file-system)

## Tech Stack

- Expo 54, React Native 0.81, React 19, TypeScript
- Navigation: React Navigation (native stack + tabs where needed)
- Styling: React Native StyleSheet and Gluestack UI.
- Data/Auth: Supabase (@supabase/supabase-js)
- Secure Storage: expo-secure-store (for auth sessions)
- File Access: expo-file-system (new Directory/File API)
- AI Integration: OpenAI API

## Prerequisites

- Node.js 18+ (LTS recommended)
- Xcode (to run the iOS simulator) or Android Studio (for Android)
- Expo Go app (optional, for device testing)
- A Supabase project (URL + anon key)
- An OpenAI API key (required only for the AI replacement feature)

## 1) Clone and install

```sh
git clone https://github.com/filiplyrheden/tastecycle.git
cd tastecycle

npm install
```

## 2) Environment variables

The app reads env vars via:

- .env → loaded in app.config.ts (Supabase config)

- process.env with Expo’s public prefix (EXPO*PUBLIC*) for build-time vars (OpenAI)

Create a .env file in the project root:

```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_OPENAI_KEY=sk-...
```

Important notes:

- The app will not boot without SUPABASE_URL and SUPABASE_ANON_KEY.
- The OpenAI key is only required when using Replace with AI.
- After modifying .env, restart the Expo dev server (npm run start).

## 3) Supabase setup (minimal)

You can adapt to your schema, but the app expects two tables:

- `profiles`

  - `id` uuid primary key (match `auth.users.id`)
  - `next_menu_index` integer not null default 0

- `recipes`
  - `id` uuid primary key (default gen)
  - `user_id` uuid not null (FK to `auth.users.id`)
  - `title` text not null
  - `ingredients` text null (stored as text; app can parse newline- or JSON-array-formatted lists)
  - `instructions` text null (same parsing behavior as `ingredients`)
  - `created_at` timestamp with time zone default now()
  - `updated_at` timestamp with time zone default now()

Row Level Security: enable RLS and add policies so users can only read/write their own rows (`recipes.user_id = auth.uid()` and `profiles.id = auth.uid()`).

If you prefer SQL to bootstrap, create matching columns and policies in your Supabase dashboard. You can evolve the schema; just keep the fields the app reads/writes.

## 4) Run the app

Start the dev server and choose a platform:

```sh
# start Metro bundler with Expo
npm run start

# or target a platform directly
npm run ios
npm run android
npm run web
```

Tips:

- iOS simulator requires Xcode; Android emulator requires Android Studio.
- You can open Expo Go on your device and scan the QR code from the terminal/DevTools.
- Web is supported for development, though some native-only features may be limited.

## Project structure

- `App.tsx`, `index.ts` – app entry and navigation containers
- `app.config.ts` – Expo config; loads `.env`, exposes Supabase keys in `extra`
- `global.css`, `tailwind.config.js`, `nativewind-env.d.ts`, `metro.config.js`, `babel.config.js` – styling and bundler setup
- `components/ui/*` – Gluestack UI primitives and themed components
- `src/lib/supabase.ts` – Supabase client (uses expo-secure-store for auth session)
- `src/lib/Authprovider.tsx` – auth context with sign in/up/out helpers
- `src/services/recipesService.ts` – recipes CRUD and weekly rotation logic
- `src/services/aiMenuService.ts` – OpenAI-powered replacement flow
- `src/utils/menuStorage.ts` – weekly menu JSON save/load via expo-file-system
- `src/utils/shoppingList.ts` – build and persist a checkable shopping list
- `src/screens/*` – Login, Menu, Recipe Collection, Add Recipe, Shopping List

## Common tasks

- Sign in: use the Login screen with your Supabase-auth user.
- Generate menu: on the Menu screen, tap “Generate Menu” to pull 5 recipes and rotate next index.
- Replace with AI: select one or more days, then tap “Replace with AI” (requires `EXPO_PUBLIC_OPENAI_KEY`).
- Shopping list: tap “Create Shopping List” to generate a deduplicated list from the week’s ingredients.

## Troubleshooting

- App crashes on launch with missing Supabase config
  - Ensure `.env` contains `SUPABASE_URL` and `SUPABASE_ANON_KEY` and restart the dev server.
- AI replacement fails
  - Ensure `.env` contains `EXPO_PUBLIC_OPENAI_KEY` and you have usage quota.
- Tailwind classes not applied
  - Check `metro.config.js` includes `withNativeWind(config, { input: './global.css' })` and `global.css` is imported in `App.tsx`.
- Stale environment variables
  - Stop and restart the dev server after changing `.env`.

## Scripts

- `npm run start` – Expo dev server
- `npm run ios` – start on iOS simulator
- `npm run android` – start on Android emulator
- `npm run web` – start on web

## License

This project is licensed under the MIT License.
