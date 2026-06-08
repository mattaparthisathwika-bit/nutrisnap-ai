# 🥗 NutriSnap AI — Cal AI Clone
> 8x Engineer Contest Submission

An AI-powered calorie & macro tracker. Snap a photo of any meal and instantly get a full nutritional breakdown powered by **OpenAI GPT-4o Vision**.

---

## ✨ Features

- 📸 **Camera / Photo Upload** → AI food recognition → instant macro breakdown
- 🍽️ **Daily Food Diary** with meal categories (breakfast, lunch, dinner, snack)
- 🍩 **Macro Progress Rings** — animated calories, protein, carbs, fat
- 📊 **Weekly History Charts** — calorie trends over 7 days
- 🔥 **Streak Tracking** — daily logging streaks
- 🎯 **Goal Setting** — personalized calorie & macro targets

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
```bash
cp .env.example .env
# Edit .env — add your OpenAI key from https://platform.openai.com/api-keys
```

### 3. Start the app

**Phone (recommended):**
```bash
npx expo start
```
Scan the QR code with **Expo Go**.

**Web (two terminals):**
```bash
# Terminal 1
npm run proxy

# Terminal 2
npx expo start --web
```
Open http://localhost:8081

---

## 📁 Project Structure

```
cal-ai-clone/
├── app/(tabs)/           # Snap, Diary, History, Profile
├── src/
│   ├── components/       # MacroRing, FoodCard
│   ├── hooks/            # useDiary.ts
│   └── utils/
│       ├── openaiVision.ts   # GPT-4o food recognition (native)
│       ├── openaiVision.web.ts
│       ├── database.ts       # SQLite (native) / localStorage (web)
│       └── imageToBase64.ts
├── scripts/openai-proxy.mjs  # Browser CORS proxy
└── .env.example
```

---

## 🤖 AI Integration

Uses **OpenAI GPT-4o** (`gpt-4o`) to analyze food photos and return:
- Total calories
- Macros: protein, carbs, fat, fiber
- Per-item breakdown
- Confidence level

See `src/utils/openaiVision.ts`. For web, run `npm run proxy`.

---

## 📋 Contest Requirements

- [x] Camera/photo upload → AI food recognition → macro breakdown
- [x] Daily diary with running calorie total
- [x] Macro progress rings (protein / carbs / fat)
- [x] Weekly history charts
- [x] Streak and goal tracking
- [x] `/ai-logs/` folder with conversation logs

---

## 🏗️ Built With

- [Expo](https://expo.dev/) + React Native
- [OpenAI API](https://platform.openai.com/) (GPT-4o Vision)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (local storage)
- [Victory Native](https://commerce.nearform.com/open-source/victory-native/) (charts)
- [React Native SVG](https://github.com/software-mansion/react-native-svg) (progress rings)
