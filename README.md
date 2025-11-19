# 🌙 Sakinah

**Sakinah** is a Chrome Extension that brings tranquility and reflection into your daily routine through the Qur’an.  
It provides **random Ayahs** at configurable intervals, or instantly when you click the extension.  
It also includes an **AI-powered guide**: describe your emotional or spiritual state, and receive the most fitting Qur’anic Ayah for peace and guidance.

---

## ✨ Features
- 🎲 **Random Ayah** on demand with one click.
- ⏰ **Configurable reminders**: set how often and when Ayah notifications appear.
- 🤖 **AI Emotional Guide**: input your current state (e.g., “I feel anxious”), and get an Ayah tailored to your situation.- 🧠 **AI Favorites Analysis**: Analyze your saved verses to discover spiritual patterns, interests, and personalized guidance.- 🌐 **Arabic + English translation** (default Sahih International).
- ⭐ Save favorite Ayahs for later reflection.
- 🔔 Browser **notifications** for scheduled Ayahs.
- 🕊 Minimal, clean UI designed to encourage calmness.

---

## 📂 Project Structure
sakinah/
│── manifest.json
│── background.js
│── popup.html
│── popup.js
│── options.html
│── options.js
│── ai.js # AI logic for state → Ayah matching│── favorites-analyzer.js # AI-powered favorites analysis│── quran.json # Local dataset of Qur’an Ayahs + translations
│── styles.css
│── icons/ # App icons for Chrome Store
│── README.md

yaml
Copy code

---

## ⚙️ Setup

### 1. Clone and Configure
```bash
git clone https://github.com/Attafii/Sakinah.git
cd sakinah
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and add your Groq API key
# Get your free API key from: https://console.groq.com/keys
```

Your `.env` file should look like:
```
GROQ_API_KEY=your_actual_api_key_here
```

### 3. Build the Extension
```bash
# Run the build script to inject your API key
build.bat
```

### 4. Load in Chrome
- Open Chrome → Extensions → Enable **Developer Mode**
- Click **Load Unpacked** → Select the `sakinah/` folder
- Click the Sakinah icon → Receive your Ayah 🌙

### 5. Before Committing Changes
```bash
# Restore config.js to template version (removes your API key)
restore-config.bat

# Now safe to commit!
git add .
git commit -m "your changes"
```

**Important**: Never commit your actual API key! The `.env` file is already in `.gitignore`.

🚀 Usage
Click icon → Random Ayah.

Options page → Set reminder frequency.

AI Guide → Describe your mood/state → Get a comforting Ayah.

🛠 Tech Stack
Chrome Extension APIs (Manifest v3)

Vanilla JavaScript

Local JSON Qur’an dataset
Groq API for enhanced NLP mapping.

---

## 🧠 AI Favorites Analysis

**Now Available!** The extension analyzes your saved Ayahs and Ahadith to provide personalized spiritual insights.

### What it does:
- **Identifies Interests**: Discovers recurring themes in your saved verses (prayer, patience, charity, etc.)
- **Infers Needs**: Understands your spiritual and emotional needs based on what you save
- **Provides Meaning**: Connects your saved items into a cohesive narrative about your spiritual journey
- **Suggests Actions**: Offers 4-6 practical, actionable steps tailored to your interests

### How it works:
1. Save your favorite Ayahs and Ahadith as you browse
2. Go to the Favorites tab and click "🧠 Analyze Favorites"
3. AI analyzes patterns and generates personalized insights
4. View your spiritual journey summary with interests, needs, meaning, and suggested actions
5. Regenerate anytime for fresh perspectives

### Privacy & Security:
- ✅ Only verse text and themes are analyzed
- ✅ No personal information (name, email, etc.) is sent
- ✅ Secure encrypted connection to AI service
- ✅ Results stored locally in your browser
- ✅ No configuration needed - works automatically
