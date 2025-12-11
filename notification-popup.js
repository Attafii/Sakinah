// notification-popup.js - Handles the notification popup window

let currentAyah = null;
let timerInterval = null;
let autoCloseTimeout = null;
const DURATION = 15000; // 15 seconds

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadNotificationData();
    setupEventListeners();
    startTimer();
});

// Load the ayah data from storage
async function loadNotificationData() {
    try {
        const data = await chrome.storage.local.get(['pendingNotificationAyah', 'showArabic', 'showTranslation']);
        
        if (data.pendingNotificationAyah) {
            currentAyah = data.pendingNotificationAyah;
            displayAyah(currentAyah, data.showArabic !== false, data.showTranslation !== false);
            
            // Clear the pending notification
            await chrome.storage.local.remove('pendingNotificationAyah');
            
            // Check if already in favorites
            await checkIfFavorited();
        } else {
            // Fallback - show a default ayah
            currentAyah = {
                id: 'default',
                arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
                translation: 'Indeed, with hardship comes ease.',
                surah: 'Ash-Sharh',
                surahNumber: 94,
                ayahNumber: 6
            };
            displayAyah(currentAyah, true, true);
        }
    } catch (error) {
        console.error('Error loading notification data:', error);
        document.getElementById('loading').innerHTML = '<div style="color: #c00;">Error loading ayah</div>';
    }
}

// Check if already favorited
async function checkIfFavorited() {
    if (!currentAyah) return;
    try {
        const storage = await chrome.storage.local.get({ favorites: [] });
        const favorites = storage.favorites || [];
        const isFavorited = favorites.some(f => f.id === currentAyah.id);
        if (isFavorited) {
            const saveBtn = document.getElementById('save-btn');
            saveBtn.innerHTML = '<span>❤️</span> Saved';
            saveBtn.classList.add('saved');
        }
    } catch (err) {
        console.error('Error checking favorites:', err);
    }
}

// Display the ayah
function displayAyah(ayah, showArabic, showTranslation) {
    const loading = document.getElementById('loading');
    const card = document.getElementById('notification-card');
    const arabicEl = document.getElementById('arabic-text');
    const translationEl = document.getElementById('translation-text');
    const referenceEl = document.getElementById('reference-text');

    // Set content
    if (showArabic && ayah.arabic) {
        arabicEl.textContent = ayah.arabic;
        arabicEl.style.display = 'block';
    } else {
        arabicEl.style.display = 'none';
    }

    if (showTranslation && ayah.translation) {
        translationEl.textContent = `"${ayah.translation}"`;
        translationEl.style.display = 'block';
    } else {
        translationEl.style.display = 'none';
    }

    referenceEl.textContent = `${ayah.surah || 'Quran'} (${ayah.surahNumber || ''}:${ayah.ayahNumber || ''})`;

    // Show card, hide loading
    loading.style.display = 'none';
    card.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Close button
    document.getElementById('close-btn').addEventListener('click', () => {
        closePopup();
    });

    // Explain Ayah button
    document.getElementById('explain-btn').addEventListener('click', async () => {
        await explainAyah();
    });

    // Close explanation
    document.getElementById('close-explanation').addEventListener('click', () => {
        document.getElementById('explanation-section').style.display = 'none';
        checkScrollButton();
    });

    // Save button
    document.getElementById('save-btn').addEventListener('click', async () => {
        await saveToFavorites();
    });

    // Scroll down button
    const scrollBtn = document.getElementById('scroll-down-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // Check scroll button visibility on scroll
    window.addEventListener('scroll', checkScrollButton);
    window.addEventListener('resize', checkScrollButton);

    // Pause timer on hover
    const card = document.getElementById('notification-card');
    card.addEventListener('mouseenter', () => {
        pauseTimer();
    });
    card.addEventListener('mouseleave', () => {
        resumeTimer();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    });

    // Initial check for scroll button
    setTimeout(checkScrollButton, 500);
}

// Check if scroll-down button should be visible
function checkScrollButton() {
    const scrollBtn = document.getElementById('scroll-down-btn');
    if (!scrollBtn) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Show button if there's more content below (more than 50px)
    if (documentHeight > windowHeight + scrollTop + 50) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
}

// Explain Ayah with AI
async function explainAyah() {
    if (!currentAyah) return;

    const explainBtn = document.getElementById('explain-btn');
    const explanationSection = document.getElementById('explanation-section');
    const explanationContent = document.getElementById('explanation-content');

    // Pause auto-close while explaining
    pauseTimer();

    // Show loading
    explainBtn.innerHTML = '<span>🤖</span> Thinking...';
    explainBtn.disabled = true;
    
    explanationSection.style.display = 'block';
    explanationContent.innerHTML = '<div class="explanation-loading"><div class="spinner"></div>Generating explanation...</div>';

    try {
        // Get API key
        const settings = await chrome.storage.sync.get({ explanationLanguage: 'english' });
        
        // Try to get API key from config.js or storage
        let apiKey = '';
        try {
            if (typeof CONFIG !== 'undefined' && CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY !== 'GROQ_API_KEY') {
                apiKey = CONFIG.GROQ_API_KEY;
            }
        } catch (e) {}
        
        if (!apiKey) {
            const stored = await chrome.storage.sync.get({ groqApiKey: '' });
            apiKey = stored.groqApiKey;
        }
        
        if (!apiKey) {
            explanationContent.innerHTML = '<div style="color: #856404; background: #fff3cd; padding: 12px; border-radius: 8px;"><strong>API key not configured.</strong><br>Please set up your Groq API key in the extension settings.</div>';
            explainBtn.innerHTML = '<span>🤖</span> Explain Ayah';
            explainBtn.disabled = false;
            return;
        }

        const langInstruction = settings.explanationLanguage === 'arabic' 
            ? 'CRITICAL: Respond ONLY in Arabic (العربية). Use Arabic script EXCLUSIVELY. Do NOT include ANY words from other languages (no English, no Russian, no Chinese, no French, etc.). Every single word must be in Arabic. If you need to use a technical term, use its Arabic equivalent or transliterate it into Arabic script.' 
            : 'Respond in English.';

        const prompt = `${langInstruction}

You are explaining this Quranic verse following the methodology of Tafsir Ibn Kathir:

**Arabic Text:** ${currentAyah.arabic || ''}
**Translation:** ${currentAyah.translation || ''}
**Surah & Verse:** ${currentAyah.surah || ''} (${currentAyah.surahNumber || ''}:${currentAyah.ayahNumber || ''})

Follow Ibn Kathir's tafsir methodology in your explanation:

1. **Tafsir al-Quran bil-Quran (Quran explains Quran):** Reference other verses that relate to or explain this verse. Mention the surah and verse numbers.

2. **Tafsir bil-Hadith (Explanation through Hadith):** If there are authentic hadiths from the Prophet ﷺ that explain this verse, mention them. Only cite well-known authentic hadiths.

3. **Linguistic Analysis:** Explain key Arabic words, their root meanings, and significance in this context.

4. **Core Message:** What is Allah teaching us? Be precise based on scholarly understanding.

5. **Practical Application:** How can a Muslim apply this verse today?

**Important Guidelines:**
- Follow the approach of Imam Ibn Kathir: use Quran to explain Quran, then Sunnah, then statements of Sahabah.
- Only cite hadiths and cross-references you are confident about. If unsure, say "Allah knows best."
- Do not invent or fabricate any references.
- Keep the tone scholarly yet accessible and spiritually uplifting.
- Aim for approximately 250-350 words.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a knowledgeable Islamic scholar trained in Quranic tafsir, particularly following the methodology of Imam Ibn Kathir (Tafsir al-Quran al-Azim). You explain verses by: 1) Using other Quran verses as explanation (Tafsir al-Quran bil-Quran), 2) Citing authentic hadiths, 3) Referencing statements of Sahabah when relevant, 4) Providing Arabic linguistic analysis. You are humble and never fabricate references. You say "Allah knows best" when uncertain. IMPORTANT: When asked to respond in Arabic, use ONLY Arabic script and Arabic words. Never mix in words from other languages like English, Russian, Chinese, etc.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
                max_completion_tokens: 800
            })
        });

        if (response.status === 401) {
            explanationContent.innerHTML = '<div style="color: #721c24; background: #f8d7da; padding: 12px; border-radius: 8px;">API authentication failed. Check your API key.</div>';
            explainBtn.innerHTML = '<span>🤖</span> Explain Ayah';
            explainBtn.disabled = false;
            return;
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const explanation = result.choices?.[0]?.message?.content || 'No explanation available.';
        
        const formattedExplanation = explanation
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
        
        explanationContent.innerHTML = formattedExplanation;
        explainBtn.innerHTML = '<span>✅</span> Explained';
        
        // Check if scroll button should appear after content loads
        setTimeout(checkScrollButton, 100);

    } catch (error) {
        console.error('Error explaining ayah:', error);
        explanationContent.innerHTML = '<div style="color: #721c24; background: #f8d7da; padding: 12px; border-radius: 8px;">Error generating explanation. Please try again.</div>';
        explainBtn.innerHTML = '<span>🤖</span> Explain Ayah';
        explainBtn.disabled = false;
        checkScrollButton();
    }
}

// Timer functionality
let remainingTime = DURATION / 1000;
let isPaused = false;

function startTimer() {
    const timerEl = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime--;
            timerEl.textContent = `${remainingTime}s`;
            
            if (remainingTime <= 0) {
                closePopup();
            }
        }
    }, 1000);

    autoCloseTimeout = setTimeout(() => {
        if (!isPaused) {
            closePopup();
        }
    }, DURATION);
}

function pauseTimer() {
    isPaused = true;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.animationPlayState = 'paused';
    
    if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
        autoCloseTimeout = null;
    }
}

function resumeTimer() {
    isPaused = false;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.animationPlayState = 'running';
    
    if (remainingTime > 0) {
        autoCloseTimeout = setTimeout(() => {
            closePopup();
        }, remainingTime * 1000);
    }
}

// Save to favorites
async function saveToFavorites() {
    if (!currentAyah) return;

    const saveBtn = document.getElementById('save-btn');
    pauseTimer();
    
    try {
        const storage = await chrome.storage.local.get({ favorites: [] });
        const favorites = storage.favorites || [];

        const exists = favorites.some(f => f.id === currentAyah.id);
        if (exists) {
            saveBtn.innerHTML = '<span>❤️</span> Already Saved';
            saveBtn.classList.add('saved');
            return;
        }

        favorites.unshift({
            ...currentAyah,
            savedAt: Date.now()
        });
        await chrome.storage.local.set({ favorites });

        saveBtn.innerHTML = '<span>❤️</span> Saved!';
        saveBtn.classList.add('saved');
        saveBtn.style.transform = 'scale(1.05)';
        setTimeout(() => { saveBtn.style.transform = ''; }, 200);

    } catch (error) {
        console.error('Error saving to favorites:', error);
        saveBtn.innerHTML = '<span>⚠️</span> Error';
    }
}

// Close popup
function closePopup() {
    if (timerInterval) clearInterval(timerInterval);
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    window.close();
}
