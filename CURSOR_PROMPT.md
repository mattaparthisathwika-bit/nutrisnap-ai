# 🤖 Cursor Prompt — NutriSnap AI (Cal AI Clone)

## PASTE THIS INTO CURSOR CHAT TO START BUILDING

---

You are building **NutriSnap AI**, a mobile calorie tracker app (Cal AI clone) using React Native + Expo. The project structure is already set up. Here's what to build next:

## Tech Stack
- React Native + Expo (~51)
- expo-router for navigation
- expo-image-picker for photos
- expo-sqlite for local storage (web uses localStorage)
- react-native-svg for macro rings
- victory-native for charts (native; simple bars on web)
- **OpenAI GPT-4o Vision** for food recognition (`src/utils/openaiVision.ts`)
- SQLite database (`src/utils/database.ts`)

## Design System
- **Theme:** Dark, clean, health-focused. Black background (#0a0a0a), white text, neon green accent (#39FF14) for calories, blue (#4A9EFF) for protein, orange (#FF6B35) for carbs, purple (#C084FC) for fat.
- **Font:** Use system fonts with bold weights for numbers
- **Style:** Minimal cards with subtle borders (#1a1a1a), rounded corners (16px)

## Screens to Build

### 1. app/_layout.tsx — Root layout with bottom tab navigator
Tabs: 📸 Snap, 📋 Diary, 📊 History, 👤 Profile

### 2. app/(tabs)/snap.tsx — Camera / Upload Screen
- Gallery / camera via expo-image-picker
- On photo → "Analyzing your meal..." → `analyzeFoodImage()` from `openaiVision.ts`
- Result modal + Add to Diary (meal type picker)

### 3. app/(tabs)/diary.tsx — Daily Food Diary
- Date selector, macro rings, grouped entries, swipe delete

### 4. app/(tabs)/history.tsx — Weekly History
- 7-day calorie chart, goal line, weekly averages, streak

### 5. app/(tabs)/profile.tsx — Goals & Settings

### 6. src/components/MacroRing.tsx — Animated SVG Ring

### 7. src/components/FoodCard.tsx — Diary Entry Card

### 8. src/hooks/useDiary.ts — Custom hook

## Important Notes
- Always call `initDatabase()` in root `_layout.tsx`
- Default date: `new Date().toISOString().split('T')[0]`
- Images: `imageToBase64.ts` (picker base64 on web; expo-file-system on native)
- API key: `EXPO_PUBLIC_OPENAI_API_KEY` in `.env`
- Web browser: run `npm run proxy` (`scripts/openai-proxy.mjs`) for CORS

Start with Snap + AI flow first.
