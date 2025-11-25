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
    });

    // Save button
    document.getElementById('save-btn').addEventListener('click', async () => {
        await saveToFavorites();
    });

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
            ? 'Respond in Arabic.' 
            : 'Respond in English.';

        const prompt = `${langInstruction} As an Islamic scholar, briefly explain this Quranic verse:

Arabic: ${currentAyah.arabic || ''}
Translation: ${currentAyah.translation || ''}
Source: ${currentAyah.surah || ''} (${currentAyah.surahNumber || ''}:${currentAyah.ayahNumber || ''})

Provide: 1) Key meaning, 2) Context, 3) One practical application. Keep it under 120 words.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a knowledgeable Islamic scholar who explains Quranic verses with clarity and warmth.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_completion_tokens: 400
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

    } catch (error) {
        console.error('Error explaining ayah:', error);
        explanationContent.innerHTML = '<div style="color: #721c24; background: #f8d7da; padding: 12px; border-radius: 8px;">Error generating explanation. Please try again.</div>';
        explainBtn.innerHTML = '<span>🤖</span> Explain Ayah';
        explainBtn.disabled = false;
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
