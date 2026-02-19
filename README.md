<h1 style="font-size:48px; color:#0b3d91; margin-bottom:8px">🌙 Sakinah — A Calm Beginning</h1>

<p style="font-size:18px; color:#333; max-width:900px">Sakinah is a browser extension that brings tranquility, spiritual reflection, and organized productivity to your daily digital life.</p>

<p>
	<a href="https://chromewebstore.google.com/detail/sakinah/imobigiagbmnloclcblmollcadpmhmgn?utm_source=item-share-cb"><img src="https://img.shields.io/badge/Chrome%20Web%20Store-Open-blue?logo=google-chrome" alt="Chrome Web Store"></a>
	<a href="https://sakinah.attafii.dev/"><img src="https://img.shields.io/badge/Website-sakinah.attafii.dev-green?logo=internet-explorer" alt="Website"></a>
</p>

<img width="779" height="440" alt="image" src="https://github.com/user-attachments/assets/5e932421-2cca-4508-b468-2d1e652a7440" />

---

## ✨ Features (Highlights)

<p style="font-size:20px">
	<span style="display:inline-block;background:#e8f3ff;color:#0b66c3;padding:6px 10px;border-radius:18px;margin-right:6px">🕋 New Tab</span>
	<span style="display:inline-block;background:#fff3e0;color:#ff9800;padding:6px 10px;border-radius:18px;margin-right:6px">🤖 AI Guide</span>
	<span style="display:inline-block;background:#e8f7ef;color:#0b9d58;padding:6px 10px;border-radius:18px;margin-right:6px">📅 Prayer Times</span>
	<span style="display:inline-block;background:#f3e8ff;color:#7b1fa2;padding:6px 10px;border-radius:18px">🔒 Privacy First</span>
	</p>
<img width="776" height="440" alt="image" src="https://github.com/user-attachments/assets/2a569773-d967-40af-b8e3-67bc695c7f5e" />

### 🕋 Spiritual Dashboard (New Tab)
<p style="font-size:16px;color:#222">Transform your new tab into a peaceful sanctuary:</p>
- <strong style="color:#0b66c3">Daily Ayah & Rotation</strong>: Beautifully rendered verses with optional random or daily rotation.
- <strong style="color:#0b66c3">Prayer Times</strong>: Automatic geo-located or city-based prayer timings with real-time "active" prayer highlighting.
- <strong style="color:#0b66c3">Sunnah of the Day</strong>: Rotating prophetic traditions presented in both <strong>Arabic</strong> and <strong>English</strong>.
- <strong style="color:#0b66c3">Daily Deeds</strong>: Track 5 customizable spiritual goals with a clean progress UI.
- <strong style="color:#0b66c3">Gratitude Journal</strong>: Private journal with history modal and .txt export.
- <strong style="color:#0b66c3">Bilingual Hijri Calendar</strong> and <strong>Quranic Quiz</strong> for interactive learning.

<img width="780" height="440" alt="image" src="https://github.com/user-attachments/assets/2d14582e-b7c5-43de-b884-4f527b16025a" />

### 🤖 Sakinah AI Guide
- <strong style="color:#7b1fa2">Empathetic Chat</strong>: Receive comforting advice and relevant Quranic verses.
- <strong style="color:#7b1fa2">Bilingual Explanations</strong>: Deep-dives into Ayahs in Arabic and English.
- <strong style="color:#7b1fa2">Favorites Analysis</strong>: AI-powered insights that identify spiritual patterns in your saved verses.

<img width="774" height="440" alt="image" src="https://github.com/user-attachments/assets/bd2eb7cd-2c49-44ad-bb0e-3e287624f144" />


### 🛠️ Customization & Productivity
- <strong style="color:#0b9d58">Personalized Wallpapers</strong>: Upload or set by URL.
- <strong style="color:#0b9d58">Theme Support</strong>: Light, Dark, Auto (sunset-sync).
- <strong style="color:#0b9d58">Bookmarks & Privacy</strong>: Searchable bookmarks sidebar and optional recent-tabs manager.
<img width="782" height="440" alt="image" src="https://github.com/user-attachments/assets/78b3483f-52ab-49df-9e5e-926ef43a649d" />
<img width="788" height="440" alt="image" src="https://github.com/user-attachments/assets/9a708536-3871-4155-b3cc-6dcf62dbe035" />

---

## 📂 Project Structure
<pre style="background:#f7f9fc;padding:12px;border-radius:8px">sakinah/
│── manifest.json      # Extension configuration with optional permissions
│── background.js      # Background logic for notifications and state
│── newtab.html/js     # Central dashboard experience
│── popup.html/js      # Quick-access extension popup
│── options.html/js    # Detailed settings and customization
│── ai.js              # Dual-language AI integration (Groq/Llama 3)
│── config.js          # Default settings and proxy endpoints
│── quran.json         # Curated Quranic dataset
│── adhkar.json/ahadith.json # Spiritual content libraries
│── styles.css         # Glassmorphism and responsive design
│── build.bat          # Deployment and key injection script
│── icons/             # Islamic branding assets
</pre>

---

## ⚙️ Setup

### 1. Installation
1. Clone the repository: `git clone https://github.com/Attafii/Sakinah.git`
2. Open Chrome -> `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked** and select the Sakinah folder.

### 2. Configuration
- Get a free API key from [Groq Console](https://console.groq.com/keys).
- Create a `.env` file or use `build.bat` to inject your `GROQ_API_KEY`.
- Use `restore-config.bat` before committing to keep your keys private.

---

## 🧠 AI Favorites Analysis
Go to the **Favorites** tab and click "Analyze Favorites" to see personalized spiritual insights.

### Privacy & Security
- ✅ <strong>No Personal Data</strong>: Only verse identifiers are used for analysis.
- ✅ <strong>Local Storage</strong>: All history and settings remain in your browser.
- ✅ <strong>Optional Permissions</strong>: Sensitive features enable only when you choose.

---

## 🛠 Tech Stack
- **Manifest V3** Chrome Extension API
- **Groq AI (Llama 3.3)** for multilingual NLP
- **Vanilla JavaScript & Glassmorphism CSS**
- **Aladhan API** for precise global prayer timings

---

If you'd like a version tailored for GitHub Pages (README → docs/index.html) I can generate that next.
