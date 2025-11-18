# 🌙 Sakinah

**Sakinah** is a Chrome Extension that brings tranquility and reflection into your daily routine through the Qur’an.  
It provides **random Ayahs** at configurable intervals, or instantly when you click the extension.  
It also includes an **AI-powered guide**: describe your emotional or spiritual state, and receive the most fitting Qur’anic Ayah for peace and guidance.

---

## ✨ Features
- 🎲 **Random Ayah** on demand with one click.
- ⏰ **Configurable reminders**: set how often and when Ayah notifications appear.
- 🤖 **AI Emotional Guide**: input your current state (e.g., “I feel anxious”), and get an Ayah tailored to your situation.
- 🌐 **Arabic + English translation** (default Sahih International).
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
│── ai.js # AI logic for state → Ayah matching
│── quran.json # Local dataset of Qur’an Ayahs + translations
│── styles.css
│── icons/ # App icons for Chrome Store
│── README.md

yaml
Copy code

---

## ⚙️ Setup
1. Clone this repo:
   ```bash
   git clone https://github.com/yourusername/sakinah.git
   cd sakinah
Open Chrome → Extensions → Enable Developer Mode → Load Unpacked → Select sakinah/.

Click the Sakinah icon → Receive your Ayah 🌙.

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

## 🚧 Future Work — AI analysis of Favorites

Planned feature: analyze the user's saved favorites (Ayahs and Ahadith) and produce a concise, actionable summary describing:

- **Interests:** the themes/topics the user repeatedly saves (e.g., prayer, patience, anxiety, charity).
- **Needs:** inferred spiritual or emotional needs suggested by the saved items (e.g., comfort, guidance, motivation).
- **Meaning & Synthesis:** a short, human-readable explanation that ties the saved items together and suggests practical next steps.

Design considerations and options:

- **Where the analysis runs:**
   - *Offline summarizer (default/fallback):* runs locally in the extension using keyword/tag frequency, simple heuristics and templates — preserves privacy and requires no API key.
   - *LLM-assisted analysis (optional):* calls an external model (e.g., OpenAI/Groq) for richer, contextual summaries. This requires an API key and explicit user consent.

- **Privacy:**
   - If LLM integration is enabled, the extension will clearly inform the user what data (the saved favorites' text and tags) will be sent to the provider and ask for confirmation before sending.
   - Summaries are stored only in `chrome.storage.local` unless the user chooses to export/share them.
   - No personal identifiers (email, account tokens) are sent as part of the analysis payload.

- **UI & UX:**
   - A new **Analyze Favorites** button in the Favorites tab will trigger analysis.
   - While analyzing, a progress indicator will show. Results will be displayed in a structured summary card with: Interests, Needs, Meaning, and Suggested Actions.
   - The user can regenerate the summary, save it, or clear stored analyses.

- **Implementation notes:**
   - Keep analysis modular: `analyzeFavoritesOffline()` and `analyzeFavoritesWithLLM()` functions.
   - If LLM use is enabled, make API calls from the background service worker (so the API key can be stored in `chrome.storage.sync` and not exposed directly in popup UI).
   - Provide a privacy toggle and an explanation in the Options page before first use.

- **Testing & rollout:**
   - Start with the offline summarizer and basic UI to gather user feedback.
   - Add LLM integration as an opt-in enhancement after confirming privacy text and usage limits.

This feature is planned and described here to provide perspective on how richer, personalized reflection tools could be added without sacrificing user privacy or control.
