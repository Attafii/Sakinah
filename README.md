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
