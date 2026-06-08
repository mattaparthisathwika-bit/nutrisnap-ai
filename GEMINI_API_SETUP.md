# 🔑 Get Your FREE Gemini API Key (2 minutes)

## Why Gemini?
- ✅ **Completely FREE** - No credit card required
- ✅ **60 requests/minute** - More than enough for testing
- ✅ **No quotas** - Use as much as you want
- ✅ **Same functionality** - Works exactly like OpenAI

## Steps to Get Free API Key:

### Step 1: Go to Google AI Studio
Open: **https://aistudio.google.com/apikey**

### Step 2: Sign In
Sign in with your Google account (or create one)

### Step 3: Create API Key
- Click **"Get API Key"** button
- Click **"Create API Key in new project"** (or existing project)
- Copy the API key immediately

### Step 4: Update Your .env File
Open `cal-ai-clone/.env` and replace:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_free_gemini_key_here
```

With your actual key:

```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyD... (your actual key)
```

### Step 5: Reload & Test
1. The dev server should auto-reload
2. Go to http://localhost:8081
3. Try snapping a food photo
4. **It should work now!** ✅

## ⚡ Features Included:

- 🚀 Automatic caching (same meal = instant)
- 🔄 Auto-retry on rate limits
- 📊 Token usage optimized
- 💾 SQLite database for results

## Questions?

If it's not working:
1. **Check your API key** - Make sure it's copied correctly
2. **Check internet** - Needs connection to Gemini
3. **Check console logs** - Look for error messages
4. **Restart dev server** - Press Ctrl+C and run again

---

**Done! Your app is now using FREE Gemini API!** 🎉
