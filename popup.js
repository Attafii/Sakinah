// popup.js - Main popup functionality

// Helper function to initialize Lucide icons
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

class SakinahPopup {
    constructor() {
        this.currentTab = 'random';
        this.ayahData = null;
        this.init();
    }

    async init() {
        await this.checkOnboarding();
        await this.loadQuranData();
        this.setupEventListeners();
        this.loadSettings();
        this.fetchPrayerTimes();
        this.showRandomAyah();
        this.loadFavorites();
        // Initialize Lucide icons after page load
        setTimeout(() => initLucideIcons(), 100);
        // hadith state
        this.hadithData = null;
        this.currentHadithIndex = -1;
        // hifdh (memorization) state
        this.hifdhData = null;
        this.hifdhState = {
            surahIndex: -1,
            ayahIndex: 0,
            mode: 'learn', // 'learn', 'quiz', or 'listen'
            memorized: {} // Track memorized ayahs
        };
        this.hifdhAudio = null; // Audio element for listen mode
        // Quiz game state
        this.quizState = {
            score: 0,
            streak: 0,
            correctIndex: -1,
            answered: false
        };
    }

    async checkOnboarding() {
        const result = await chrome.storage.sync.get(['settings']);
        if (!result.settings || result.settings.onboardingCompleted !== true) {
            window.location.href = 'onboarding.html';
        }
    }

    // Load Quran data from JSON file
    async loadQuranData() {
        try {
            const response = await fetch(chrome.runtime.getURL('quran.json'));
            this.ayahData = await response.json();
            console.log('Quran data loaded successfully');
        } catch (error) {
            console.error('Error loading Quran data:', error);
            this.showError('Failed to load Quran data');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button') || [];
        tabButtons.forEach(button => {
            if (!button) return;
            button.addEventListener('click', (e) => {
                const tab = e.target && e.target.dataset ? e.target.dataset.tab : null;
                if (tab) this.switchTab(tab);
            });
        });

        // Random Ayah refresh
        const refreshBtn = document.getElementById('refresh-ayah');
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.showRandomAyah());

        // Explain Ayah with AI
        const explainAyahBtn = document.getElementById('explain-ayah');
        if (explainAyahBtn) explainAyahBtn.addEventListener('click', () => this.explainCurrentAyah());

        const closeAyahExplanation = document.getElementById('close-ayah-explanation');
        if (closeAyahExplanation) closeAyahExplanation.addEventListener('click', () => {
            document.getElementById('ayah-explanation').style.display = 'none';
        });

        // Explain Hadith with AI
        const explainHadithBtn = document.getElementById('explain-hadith');
        if (explainHadithBtn) explainHadithBtn.addEventListener('click', () => this.explainCurrentHadith());

        const closeHadithExplanation = document.getElementById('close-hadith-explanation');
        if (closeHadithExplanation) closeHadithExplanation.addEventListener('click', () => {
            document.getElementById('hadith-explanation').style.display = 'none';
        });

        // AI Guide functionality
        const guidanceBtn = document.getElementById('get-guidance');
        if (guidanceBtn) guidanceBtn.addEventListener('click', () => this.sendChatMessage());

        // Enter key to send message in AI Guide
        const textarea = document.getElementById('emotional-state');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }

        // Clear chat button
        const clearChatBtn = document.getElementById('clear-chat');
        if (clearChatBtn) clearChatBtn.addEventListener('click', () => this.clearChat());

        // Arabic mode toggle
        const arabicModeToggle = document.getElementById('arabic-mode-toggle');
        if (arabicModeToggle) {
            // Load saved preference
            chrome.storage.sync.get({ arabicMode: false }, (result) => {
                arabicModeToggle.checked = result.arabicMode;
            });
            // Save preference on change
            arabicModeToggle.addEventListener('change', (e) => {
                chrome.storage.sync.set({ arabicMode: e.target.checked });
            });
        }

        // Character count for textarea
        const charCount = document.getElementById('char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length;
            });
        }

        // Mood chips click handlers
        const moodChips = document.querySelectorAll('.mood-chip');
        moodChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const mood = e.target.dataset.mood;
                if (mood) {
                    // Set the textarea value and send message
                    const textarea = document.getElementById('emotional-state');
                    if (textarea) {
                        textarea.value = `I'm feeling ${mood}. Can you help me find peace?`;
                        document.getElementById('char-count').textContent = textarea.value.length;
                    }
                    // Highlight selected chip temporarily
                    moodChips.forEach(c => {
                        c.style.background = 'white';
                        c.style.color = '#2B8C7B';
                    });
                    e.target.style.background = 'linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%)';
                    e.target.style.color = 'white';
                    // Send the message
                    this.sendChatMessage();
                    // Reset chip after a moment
                    setTimeout(() => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#2B8C7B';
                    }, 1000);
                }
            });
        });

        // Settings
        const notificationsEnabledEl = document.getElementById('notifications-enabled');
        if (notificationsEnabledEl) notificationsEnabledEl.addEventListener('change', (e) => this.toggleNotifications(e.target.checked));

        const notificationFreqEl = document.getElementById('notification-frequency');
        if (notificationFreqEl) notificationFreqEl.addEventListener('change', (e) => this.updateNotificationFrequency(e.target.value));

        const showArabicEl = document.getElementById('show-arabic');
        if (showArabicEl) showArabicEl.addEventListener('change', (e) => this.updateDisplaySetting('showArabic', e.target.checked));

        const showTranslationEl = document.getElementById('show-translation');
        if (showTranslationEl) showTranslationEl.addEventListener('change', (e) => this.updateDisplaySetting('showTranslation', e.target.checked));

        const openOptionsEl = document.getElementById('open-options');
        if (openOptionsEl) openOptionsEl.addEventListener('click', () => chrome.runtime.openOptionsPage());

        // Export Data placeholder (or real export of favorites)
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportFavorites());

        // Help button - show help information
        const helpBtn = document.getElementById('help-button');
        if (helpBtn) helpBtn.addEventListener('click', () => this.showHelpModal());

        // Save favorite button (from Random Ayah view)
        const saveFavBtn = document.getElementById('save-favorite');
        if (saveFavBtn) saveFavBtn.addEventListener('click', () => {
            if (this.currentTab === 'ahadith') {
                this.saveCurrentHadithToFavorites();
            } else {
                this.saveCurrentAyahToFavorites();
            }
        });

        // Save hadith favorite (specific button in hadith tab)
        const saveHadithBtn = document.getElementById('save-hadith-favorite');
        if (saveHadithBtn) saveHadithBtn.addEventListener('click', () => this.saveCurrentHadithToFavorites());

        // Hadith random button
        const rndBtn = document.getElementById('hadith-random');
        if (rndBtn) rndBtn.addEventListener('click', () => this.showRandomHadith());

        // Hadith collection filter
        const collectionFilter = document.getElementById('hadith-collection-filter');
        if (collectionFilter) {
            collectionFilter.addEventListener('change', () => this.showRandomHadith());
        }

        // Hifdh UI elements
        const surahSelect = document.getElementById('surah-select');
        if (surahSelect) surahSelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            this.hifdhState.surahIndex = idx;
            this.hifdhState.ayahIndex = 0;
            this.loadHifdhMemorizedState();
            this.updateHifdhProgressUI();
            this.ensureHifdhLoaded().then(() => this.showHifdhAyah());
        });

        // Mode buttons
        const hLearn = document.getElementById('hifdh-learn');
        if (hLearn) hLearn.addEventListener('click', () => this.setHifdhMode('learn'));
        const hQuiz = document.getElementById('hifdh-quiz');
        if (hQuiz) hQuiz.addEventListener('click', () => this.setHifdhMode('quiz'));
        const hListen = document.getElementById('hifdh-listen');
        if (hListen) hListen.addEventListener('click', () => this.setHifdhMode('listen'));
        
        const hReset = document.getElementById('hifdh-reset');
        if (hReset) hReset.addEventListener('click', () => this.resetHifdhProgress());
        const hRandom = document.getElementById('hifdh-random');
        if (hRandom) hRandom.addEventListener('click', () => this.randomHifdhAyah());

        // Navigation
        const hPrev = document.getElementById('hifdh-prev');
        if (hPrev) hPrev.addEventListener('click', () => this.hifdhPrev());
        const hNext = document.getElementById('hifdh-next');
        if (hNext) hNext.addEventListener('click', () => this.hifdhNext());
        const hMark = document.getElementById('hifdh-mark');
        if (hMark) hMark.addEventListener('click', () => this.toggleMarkMemorized());

        // Quiz game controls - Multiple choice options
        const quizOptions = document.querySelectorAll('.quiz-option');
        quizOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const optionIndex = parseInt(btn.dataset.option);
                this.selectQuizOption(optionIndex);
            });
        });

        // Quiz next button
        const quizNextBtn = document.getElementById('quiz-next-btn');
        if (quizNextBtn) quizNextBtn.addEventListener('click', () => this.nextQuizQuestion());

        // Listen controls
        const hPlay = document.getElementById('hifdh-play');
        if (hPlay) hPlay.addEventListener('click', () => this.playHifdhAudio());
        const hRepeat = document.getElementById('hifdh-repeat');
        if (hRepeat) hRepeat.addEventListener('click', () => this.repeatHifdhAudio());

        // Keyboard navigation for Hifdh
        document.addEventListener('keydown', (e) => {
            if (this.currentTab !== 'hifdh') return;
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
            
            if (this.hifdhState.mode === 'quiz' && !this.quizState.answered) {
                // Number keys 1-3 for quiz options
                if (e.key === '1') this.selectQuizOption(0);
                if (e.key === '2') this.selectQuizOption(1);
                if (e.key === '3') this.selectQuizOption(2);
            } else {
                if (e.key === 'ArrowRight') this.hifdhNext();
                if (e.key === 'ArrowLeft') this.hifdhPrev();
                if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    this.toggleMarkMemorized();
                }
            }
            
            // Enter to go to next question after answering
            if (e.key === 'Enter' && this.hifdhState.mode === 'quiz' && this.quizState.answered) {
                this.nextQuizQuestion();
            }
        });
    }

    // Switch between tabs
    switchTab(tabName) {
        // Remove active class from all tabs and content
        const tabBtns = document.querySelectorAll('.tab-button') || [];
        tabBtns.forEach(btn => { if (btn && btn.classList) btn.classList.remove('active'); });

        const tabContents = document.querySelectorAll('.tab-content') || [];
        tabContents.forEach(content => { if (content && content.classList) content.classList.remove('active'); });

        // Add active class to selected tab and content
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn && selectedBtn.classList) selectedBtn.classList.add('active');

        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedContent && selectedContent.classList) selectedContent.classList.add('active');

        this.currentTab = tabName;
        // If switching to hadith tab, ensure hadiths are loaded
        if (tabName === 'ahadith') {
            this.ensureHadithLoaded();
        }
        // If switching to Hifdh tab, ensure hifdh data is loaded and UI shown
        if (tabName === 'hifdh') {
            this.ensureHifdhLoaded().then(() => {
                const sel = document.getElementById('surah-select');
                if (sel && this.hifdhState && typeof this.hifdhState.surahIndex === 'number') {
                    sel.value = String(this.hifdhState.surahIndex);
                }
                // display first ayah
                this.showHifdhAyah();
            });
        }
    }

    async ensureHadithLoaded() {
        if (!this.hadithData) {
            await this.loadAhadith();
            this.showRandomHadith();
        }
    }

    // Load Ahadith data
    async loadAhadith() {
        try {
            const response = await fetch(chrome.runtime.getURL('ahadith.json'));
            const data = await response.json();
            this.hadithData = Array.isArray(data.hadiths) ? data.hadiths : [];
            console.log('Hadith data loaded:', this.hadithData.length, 'entries');
        } catch (err) {
            console.error('Error loading hadiths:', err);
            // show an inline message in hadith tab
            const loadingEl = document.getElementById('hadith-loading');
            if (loadingEl) loadingEl.innerHTML = '<div style="color:#c00; text-align:center;">Failed to load Ahadith data.</div>';
        }
    }

    // Search hadiths (simple client-side search)
    searchHadiths(query) {
        if (!this.hadithData) return;
        const q = query.toLowerCase();
        const results = this.hadithData.filter(h => {
            return (h.arabic_text && h.arabic_text.toLowerCase().includes(q)) ||
                   (h.english_translation && h.english_translation.toLowerCase().includes(q)) ||
                   (h.tags && h.tags.join(' ').toLowerCase().includes(q)) ||
                   (h.source && h.source.toLowerCase().includes(q));
        });
        this.renderHadithList(results);
    }

    // Render a list of hadith cards
    renderHadithList(list) {
        const root = document.getElementById('hadith-list');
        if (!root) return;
        root.innerHTML = '';
        if (!list || list.length === 0) {
            root.innerHTML = '<div style="color:#666">No Ahadith found.</div>';
            return;
        }

        list.forEach((h, idx) => {
            const card = document.createElement('div');
            card.className = 'hadith-card';
            card.style.border = '1px solid #eee';
            card.style.padding = '12px';
            card.style.borderRadius = '8px';
            card.style.background = '#fff';

            card.innerHTML = `
                <div style="font-size:1.05em; direction:rtl; font-family: 'Scheherazade', serif;">${h.arabic_text}</div>
                <div style="margin-top:8px; font-size:0.95em;">${h.english_translation}</div>
                <div style="margin-top:8px; color:#666; font-size:0.85em;">${h.source} • ${h.book || ''}</div>
                <div style="margin-top:8px; display:flex; gap:8px;">
                    <button class="secondary-button" data-idx="${idx}" data-action="open">Open</button>
                    <button class="secondary-button" data-idx="${idx}" data-action="save">Save</button>
                </div>
            `;

            // open action -> display full hadith at this index in the full dataset
            card.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = btn.dataset.action;
                    if (action === 'open') {
                        // find index in overall hadithData
                        const globalIndex = this.hadithData.indexOf(list[idx]);
                        if (globalIndex >= 0) {
                            this.currentHadithIndex = globalIndex;
                            this.displayHadith(this.hadithData[this.currentHadithIndex]);
                        }
                    } else if (action === 'save') {
                        // save this hadith
                        const globalIndex = this.hadithData.indexOf(list[idx]);
                        if (globalIndex >= 0) {
                            this.currentHadithIndex = globalIndex;
                            this.displayHadith(this.hadithData[this.currentHadithIndex]);
                            this.saveCurrentHadithToFavorites();
                        }
                    }
                });
            });

            root.appendChild(card);
        });
    }

    // Get filtered hadiths based on selected collection
    getFilteredHadiths() {
        if (!this.hadithData || this.hadithData.length === 0) return [];
        
        const filterEl = document.getElementById('hadith-collection-filter');
        const selectedCollection = filterEl ? filterEl.value : 'all';
        
        if (selectedCollection === 'all') {
            return this.hadithData;
        }
        
        return this.hadithData.filter(h => h.collection_id === selectedCollection);
    }
    
    // Show a random hadith
    showRandomHadith() {
        if (!this.hadithData || this.hadithData.length === 0) return;
        
        // Show loading state
        const contentEl = document.getElementById('hadith-content');
        const loadingEl = document.getElementById('hadith-loading');
        if (contentEl) contentEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'block';
        
        // Get filtered hadiths based on collection filter
        const filteredHadiths = this.getFilteredHadiths();
        
        if (filteredHadiths.length === 0) {
            if (loadingEl) loadingEl.innerHTML = '<div style="color:#666; text-align:center;">No hadiths in this collection.</div>';
            return;
        }
        
        const randomIdx = Math.floor(Math.random() * filteredHadiths.length);
        const selectedHadith = filteredHadiths[randomIdx];
        
        // Find the actual index in the full hadithData array
        this.currentHadithIndex = this.hadithData.indexOf(selectedHadith);
        
        // Small delay for better UX like ayah
        setTimeout(() => {
            this.displayHadith(selectedHadith);
        }, 600);
    }

    showPrevHadith() {
        if (!this.hadithData || this.hadithData.length === 0) return;
        this.currentHadithIndex = (this.currentHadithIndex <= 0) ? (this.hadithData.length - 1) : (this.currentHadithIndex - 1);
        this.displayHadith(this.hadithData[this.currentHadithIndex]);
    }

    showNextHadith() {
        if (!this.hadithData || this.hadithData.length === 0) return;
        this.currentHadithIndex = (this.currentHadithIndex >= this.hadithData.length - 1) ? 0 : (this.currentHadithIndex + 1);
        this.displayHadith(this.hadithData[this.currentHadithIndex]);
    }

    displayHadith(hadith) {
        // Display hadith in the same style as ayah display
        const arabicEl = document.getElementById('hadith-arabic');
        const translationEl = document.getElementById('hadith-translation');
        const referenceEl = document.getElementById('hadith-reference');
        const contentEl = document.getElementById('hadith-content');
        const loadingEl = document.getElementById('hadith-loading');

        if (arabicEl) arabicEl.textContent = hadith.arabic_text || '';
        if (translationEl) translationEl.textContent = hadith.english_translation || '';
        if (referenceEl) referenceEl.textContent = `${hadith.source} • ${hadith.book || ''}`;

        // Show content, hide loading
        if (contentEl) contentEl.style.display = 'block';
        if (loadingEl) loadingEl.style.display = 'none';

        // track currentHadith for save
        this.currentHadith = hadith;
        
        // Reset heart icon for new hadith
        const saveBtn = document.getElementById('save-hadith-favorite');
        if (saveBtn) {
            saveBtn.innerHTML = '<i data-lucide="heart"></i>';
            initLucideIcons();
            saveBtn.classList.remove('saved');
        }
    }

    // Save hadith to favorites
    async saveCurrentHadithToFavorites() {
        if (!this.currentHadith) {
            alert('No Hadith selected to save.');
            return;
        }

        const saveBtn = document.getElementById('save-hadith-favorite');

        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];

            const exists = favorites.some(f => f.type === 'hadith' && f.hadith_id === this.currentHadith.hadith_id);
            if (exists) {
                // Visual feedback - already saved
                if (saveBtn) {
                    saveBtn.innerHTML = '<i data-lucide="heart"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    saveBtn.classList.add('saved');
                }
                return;
            }

            const entry = Object.assign({ type: 'hadith' }, this.currentHadith);
            favorites.unshift(entry);
            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            
            // Visual feedback - heart animation
            if (saveBtn) {
                saveBtn.innerHTML = '<i data-lucide="heart"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                saveBtn.classList.add('saved');
            }
        } catch (err) {
            console.error('Error saving hadith favorite:', err);
            alert('Could not save hadith favorite.');
        }
    }

    // Display a random Ayah
    showRandomAyah() {
        if (!this.ayahData || !this.ayahData.ayahs) {
            this.showError('No Ayah data available');
            return;
        }

        this.showLoading(true);

        // Get random ayah
        const randomIndex = Math.floor(Math.random() * this.ayahData.ayahs.length);
        const ayah = this.ayahData.ayahs[randomIndex];

        setTimeout(() => {
            this.displayAyah(ayah, 'random');
            this.showLoading(false);
        }, 800); // Small delay for better UX
    }

    // Display an Ayah in the specified context
    displayAyah(ayah, context = 'random') {
        const prefix = context === 'ai' ? 'ai-' : '';
        const arabicEl = document.getElementById(`${prefix}ayah-arabic`);
        const translationEl = document.getElementById(`${prefix}ayah-translation`);
        const referenceEl = document.getElementById(`${prefix}ayah-reference`);

        if (arabicEl) arabicEl.textContent = ayah.arabic || '';
        if (translationEl) translationEl.textContent = ayah.translation || '';
        if (referenceEl) referenceEl.textContent = `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`;

        if (context === 'random') {
            const ayahContentEl = document.getElementById('ayah-content');
            if (ayahContentEl) ayahContentEl.style.display = 'block';
            
            // Reset heart icon for new ayah
            const saveBtn = document.getElementById('save-favorite');
            if (saveBtn) {
                saveBtn.innerHTML = '<i data-lucide="heart"></i>';
                initLucideIcons();
                saveBtn.classList.remove('saved');
            }
        }

        // Track current ayah for actions like saving to favorites
        this.currentAyah = ayah;
    }

    // Favorites management
    async saveCurrentAyahToFavorites() {
        if (!this.currentAyah) {
            alert('No Ayah to save.');
            return;
        }

        const saveBtn = document.getElementById('save-favorite');

        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];

            // Avoid duplicates by id
            const exists = favorites.some(f => f.id === this.currentAyah.id);
            if (exists) {
                // Visual feedback - already saved
                if (saveBtn) {
                    saveBtn.innerHTML = '<i data-lucide="heart"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    saveBtn.classList.add('saved');
                }
                return;
            }

            favorites.unshift(this.currentAyah);
            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            
            // Visual feedback - heart animation
            if (saveBtn) {
                saveBtn.innerHTML = '<i data-lucide="heart"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                saveBtn.classList.add('saved');
            }
        } catch (err) {
            console.error('Error saving favorite:', err);
            alert('Could not save favorite.');
        }
    }

    async loadFavorites() {
        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];
            this.renderFavorites(favorites);
        } catch (err) {
            console.error('Error loading favorites:', err);
        }
    }

    renderFavorites(favorites) {
        // Ensure a favorites tab exists in the DOM; create if missing
        let favTab = document.getElementById('favorites-tab');
        if (!favTab) {
            // create tab content dynamically
            const main = document.querySelector('.content');
            if (!main) return;
            const div = document.createElement('div');
            div.className = 'tab-content';
            div.id = 'favorites-tab';
            div.innerHTML = `
                <div class="favorites-container">
                    <h3 style="color:#2B8C7B; display:flex; align-items:center; gap:8px;"><i data-lucide="heart"></i> <span data-i18n="favorites.yourFavorites">Your Favorites</span></h3>
                    <div id="favorites-analysis-result" style="display:none; background:linear-gradient(135deg, rgba(168, 235, 216, 0.2) 0%, rgba(114, 186, 174, 0.15) 100%); padding:18px; border-radius:12px; margin-bottom:16px; border-left:4px solid #72BAAE;">
                        <h4 style="margin:0 0 12px 0; color:#2B8C7B; display:flex; align-items:center; gap:8px;"><i data-lucide="bar-chart-2"></i> Your Spiritual Journey</h4>
                        <div id="analysis-content"></div>
                        <div style="margin-top:12px; display:flex; gap:8px;">
                            <button id="regenerate-analysis" class="secondary-button" style="display:flex; align-items:center; gap:6px;"><i data-lucide="refresh-cw"></i> Regenerate</button>
                            <button id="close-analysis" class="secondary-button" style="display:flex; align-items:center; gap:6px;"><i data-lucide="x"></i> Close</button>
                        </div>
                    </div>
                    <div id="favorites-list" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;"></div>
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button id="analyze-favorites" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:white; border:none; display:flex; align-items:center; gap:6px;"><i data-lucide="brain"></i> <span data-i18n="favorites.analyze">Analyze Favorites</span></button>
                        <button id="export-favorites" class="secondary-button" style="display:flex; align-items:center; gap:6px;"><i data-lucide="download"></i> <span data-i18n="favorites.export">Export</span></button>
                        <button id="clear-favorites" class="secondary-button" style="display:flex; align-items:center; gap:6px;"><i data-lucide="trash-2"></i> <span data-i18n="favorites.clear">Clear All</span></button>
                    </div>
                </div>
            `;
            main.appendChild(div);

            // attach handlers for newly created buttons
            setTimeout(() => {
                const analyze = document.getElementById('analyze-favorites');
                if (analyze) analyze.addEventListener('click', () => this.analyzeFavorites());
                const exp = document.getElementById('export-favorites');
                if (exp) exp.addEventListener('click', () => this.exportFavorites());
                const clear = document.getElementById('clear-favorites');
                if (clear) clear.addEventListener('click', () => this.clearFavorites());
                const regenerate = document.getElementById('regenerate-analysis');
                if (regenerate) regenerate.addEventListener('click', () => this.analyzeFavorites(true));
                const closeAnalysis = document.getElementById('close-analysis');
                if (closeAnalysis) closeAnalysis.addEventListener('click', () => {
                    document.getElementById('favorites-analysis-result').style.display = 'none';
                });
            }, 50);
            favTab = div;
        }

        const listRoot = document.getElementById('favorites-list');
        if (!listRoot) return;
        listRoot.innerHTML = '';

        if (!favorites || favorites.length === 0) {
            listRoot.innerHTML = '<div class="empty-favorites" style="text-align:center; padding:40px 20px; color:#6c757d;"><span style="font-size:3em; display:block; margin-bottom:16px; opacity:0.5;"><i data-lucide="heart" style="width:64px; height:64px;"></i></span><p>No favorites yet.<br>Tap the heart icon to save Ayahs for later reflection.</p></div>';
            initLucideIcons();
            return;
        }

        favorites.forEach(ayah => {
            const item = document.createElement('div');
            item.className = 'ayah-container';
            item.style.padding = '14px';
            item.style.borderLeft = '4px solid #ff6b6b';
            item.style.background = 'linear-gradient(145deg, #fff 0%, #fff5f5 100%)';

            if (ayah.type === 'hadith') {
                item.innerHTML = `
                    <div style="font-weight:600; color:#2B8C7B; display:flex; align-items:center; gap:6px;"><i data-lucide="message-square"></i> Hadith • ${ayah.source}</div>
                    <div style="margin-top:8px; font-style:italic; direction:rtl; font-family:'Amiri', serif;">${ayah.arabic_text}</div>
                    <div style="margin-top:8px; color:#495057; line-height:1.7;">${ayah.english_translation}</div>
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="open" style="display:flex; align-items:center; gap:6px;"><i data-lucide="book-open"></i> <span data-i18n="favorites.open">Open</span></button>
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="remove" style="color:#ee5253; display:flex; align-items:center; gap:6px;"><i data-lucide="heart-crack"></i> <span data-i18n="favorites.remove">Remove</span></button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div style="font-weight:600; color:#2B8C7B; display:flex; align-items:center; gap:6px;"><i data-lucide="book-open"></i> ${ayah.surah || 'Ayah'} ${ayah.surahNumber ? '('+ayah.surahNumber+':'+ayah.ayahNumber+')' : ''}</div>
                    ${ayah.arabic ? '<div style="margin-top:10px; direction:rtl; font-size:1.3em; font-family:\'Scheherazade\', \'Amiri\', \'Traditional Arabic\', serif; color:#1a3a36; line-height:1.9;">' + ayah.arabic + '</div>' : ''}
                    <div style="margin-top:8px; font-style:italic; color:#495057; line-height:1.7;">${ayah.translation || ayah.english_translation || ''}</div>
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.id}" data-action="open" style="display:flex; align-items:center; gap:6px;"><i data-lucide="book-open"></i> <span data-i18n="favorites.open">Open</span></button>
                        <button class="secondary-button" data-id="${ayah.id}" data-action="remove" style="color:#ee5253; display:flex; align-items:center; gap:6px;"><i data-lucide="heart-crack"></i> <span data-i18n="favorites.remove">Remove</span></button>
                    </div>
                `;
            }

            listRoot.appendChild(item);
        });

        // Attach event delegation for open/remove (support both ayah and hadith favorites)
        listRoot.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idRaw = btn.dataset.id;
                const action = btn.dataset.action;

                if (!idRaw) return;

                // Try to detect hadith ids (strings like 'bukhari-1') vs numeric ayah ids
                const isHadithId = isNaN(parseInt(idRaw, 10));

                if (action === 'open') {
                    if (isHadithId) {
                        const had = favorites.find(a => a.hadith_id === idRaw || a.hadith_id === String(idRaw));
                        if (had) {
                            // display as hadith and switch to hadith tab
                            this.currentHadith = had;
                            this.switchTab('ahadith');
                            this.displayHadith(had);
                        }
                    } else {
                        const id = parseInt(idRaw, 10);
                        const ay = favorites.find(a => a.id === id || a.ayahId === id);
                        if (ay) this.displayAyah(ay, 'random');
                        this.switchTab('random');
                    }
                } else if (action === 'remove') {
                    this.removeFavorite(idRaw);
                }
            });
        });
    }

    async removeFavorite(id) {
        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            let favorites = storage.favorites || [];

            console.log('Removing favorite with id:', id, 'type:', typeof id);

            // Convert to string for consistent comparison
            const idStr = String(id);
            const idNum = parseInt(id, 10);

            // Remove by matching ayah id OR hadith_id
            favorites = favorites.filter(f => {
                // Check hadith_id (string)
                if (f.hadith_id && (f.hadith_id === idStr || String(f.hadith_id) === idStr)) {
                    return false; // Remove this item
                }
                // Check ayah id (can be number or string)
                if (f.id !== undefined && (f.id === idNum || f.id === idStr || String(f.id) === idStr)) {
                    return false; // Remove this item
                }
                return true; // Keep this item
            });

            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            console.log('Favorite removed, remaining:', favorites.length);
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    }

    async clearFavorites() {
        if (!confirm('Clear all favorites?')) return;
        try {
            await chrome.storage.local.set({ favorites: [] });
            this.renderFavorites([]);
        } catch (err) {
            console.error('Error clearing favorites:', err);
        }
    }

    async exportFavorites() {
        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];
            const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `sakinah-favorites-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            alert('Favorites export started (check your downloads).');
        } catch (err) {
            console.error('Error exporting favorites:', err);
            alert('Could not export favorites.');
        }
    }

    async analyzeFavorites(forceRegenerate = false) {
        try {
            // Get favorites
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];

            if (favorites.length === 0) {
                alert('No favorites to analyze. Save some Ayahs or Ahadith first!');
                return;
            }

            // Get language preference from settings
            const settings = await chrome.storage.sync.get({ explanationLanguage: 'english' });
            const language = settings.explanationLanguage || 'english';

            // Show loading state
            const analyzeBtn = document.getElementById('analyze-favorites');
            const originalText = analyzeBtn.textContent;
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'AI is analyzing your spiritual journey...';
            analyzeBtn.prepend(document.createElement('i'));
            analyzeBtn.firstChild.setAttribute('data-lucide', 'loader');
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Perform AI analysis with language preference
            const result = await window.FavoritesAnalyzer.analyzeFavorites(favorites, language);

            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = originalText;

            if (result.success) {
                this.displayAnalysisResult(result.analysis, result.method);
            } else {
                alert(result.error || 'Failed to analyze favorites');
            }

        } catch (error) {
            console.error('Error analyzing favorites:', error);
            alert('An error occurred while analyzing favorites');
            
            const analyzeBtn = document.getElementById('analyze-favorites');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '🧠 Analyze Favorites';
            }
        }
    }

    displayAnalysisResult(analysis, method) {
        const resultDiv = document.getElementById('favorites-analysis-result');
        const contentDiv = document.getElementById('analysis-content');

        if (!resultDiv || !contentDiv) return;

        // Build HTML for analysis result
        let html = '';

        // Method badge
        const methodBadge = method === 'llm' 
            ? '<span style="background:#4CAF50; color:white; padding:4px 8px; border-radius:4px; font-size:0.8em; display:inline-flex; align-items:center; gap:4px;"><i data-lucide="sparkles" style="width:14px; height:14px;"></i> AI-Powered</span>'
            : '<span style="background:#2196F3; color:white; padding:4px 8px; border-radius:4px; font-size:0.8em; display:inline-flex; align-items:center; gap:4px;"><i data-lucide="bar-chart-2" style="width:14px; height:14px;"></i> Offline Analysis</span>';
        
        html += `<div style="margin-bottom:12px;">${methodBadge}</div>`;

        // Interests
        if (analysis.interests) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2; display:flex; align-items:center; gap:6px;"><i data-lucide="target"></i> Your Interests</h5>
                    <p style="margin:0; line-height:1.6;">${analysis.interests}</p>
                </div>
            `;
        }

        // Needs
        if (analysis.needs) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2; display:flex; align-items:center; gap:6px;"><i data-lucide="message-circle"></i> Spiritual Needs</h5>
                    <p style="margin:0; line-height:1.6;">${analysis.needs}</p>
                </div>
            `;
        }

        // Meaning
        if (analysis.meaning) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2; display:flex; align-items:center; gap:6px;"><i data-lucide="sparkles"></i> Meaning & Synthesis</h5>
                    <p style="margin:0; line-height:1.6; font-style:italic;">${analysis.meaning}</p>
                </div>
            `;
        }

        // Actions
        if (analysis.actions && analysis.actions.length > 0) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2; display:flex; align-items:center; gap:6px;"><i data-lucide="check-circle"></i> Suggested Actions</h5>
                    <ol style="margin:0; padding-left:20px; line-height:1.8;">
                        ${analysis.actions.map(action => `<li>${action}</li>`).join('')}
                    </ol>
                </div>
            `;
        }

        // Metadata
        if (analysis.metadata) {
            html += `
                <div style="margin-top:16px; padding-top:12px; border-top:1px solid #ddd; font-size:0.85em; color:#666;">
                    <strong>Total saved:</strong> ${analysis.metadata.totalSaved} items
                    ${analysis.metadata.topThemes ? ` • <strong>Top themes:</strong> ${analysis.metadata.topThemes.join(', ')}` : ''}
                </div>
            `;
        }

        contentDiv.innerHTML = html;
        resultDiv.style.display = 'block';
        
        // Initialize Lucide icons in the analysis content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async explainCurrentAyah() {
        if (!this.currentAyah) {
            alert('No Ayah to explain. Please load an Ayah first.');
            return;
        }

        try {
            const explainBtn = document.getElementById('explain-ayah');
            const originalText = explainBtn.textContent;
            explainBtn.disabled = true;
            explainBtn.innerHTML = '<i data-lucide="loader"></i> Thinking...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            // Load explanation language preference and request explanation
            const stored = await chrome.storage.sync.get({ explanationLanguage: 'english' });
            const lang = stored.explanationLanguage || 'english';
            const explanation = await this.getAIExplanation(this.currentAyah, 'ayah', lang);

            explainBtn.disabled = false;
            explainBtn.innerHTML = originalText;

            const explanationDiv = document.getElementById('ayah-explanation');
            const contentDiv = document.getElementById('ayah-explanation-content');

            if (!explanation) {
                contentDiv.innerHTML = '<div class="explain-error">Failed to generate explanation. Please try again later.</div>';
                explanationDiv.style.display = 'block';
                return;
            }

            if (typeof explanation === 'object' && explanation.status) {
                if (explanation.status === 'no_key') {
                    contentDiv.innerHTML = '<div class="explain-warning"><strong>Groq API key not found.</strong><br>To enable AI explanations, please configure your Groq API key in the extension options.<div style="margin-top:10px;"><button id="open-options-for-key" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:#1a3a36; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;"><i data-lucide="settings"></i> Open Settings</button></div></div>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    setTimeout(() => {
                        const btn = document.getElementById('open-options-for-key');
                        if (btn) btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
                    }, 50);
                } else if (explanation.status === 'auth_failed') {
                    contentDiv.innerHTML = '<div class="explain-error">Groq API authentication failed (401). Please check your API key configuration.</div>';
                } else if (explanation.status === 'api_error') {
                    contentDiv.innerHTML = `<div class="explain-error">Groq API error (${explanation.code}). Try again later.</div>`;
                } else if (explanation.status === 'network_error') {
                    contentDiv.innerHTML = '<div class="explain-error">Network error contacting Groq API. Check your connection.</div>';
                } else {
                    contentDiv.innerHTML = '<div class="explain-error">Unable to generate explanation.</div>';
                }

                explanationDiv.style.display = 'block';
                return;
            }

            // Success: explanation is HTML string
            contentDiv.innerHTML = explanation;
            explanationDiv.style.display = 'block';
            explanationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Error explaining Ayah:', error);
            const explanationDiv = document.getElementById('ayah-explanation');
            const contentDiv = document.getElementById('ayah-explanation-content');
            contentDiv.innerHTML = '<div class="explain-error">An error occurred while generating the explanation.</div>';
            explanationDiv.style.display = 'block';
            const explainBtn = document.getElementById('explain-ayah');
            if (explainBtn) {
                explainBtn.disabled = false;
                explainBtn.textContent = '🤖 Explain';
            }
        }
    }

    async explainCurrentHadith() {
        if (!this.currentHadith) {
            alert('No Hadith to explain. Please load a Hadith first.');
            return;
        }

        try {
            const explainBtn = document.getElementById('explain-hadith');
            const originalText = explainBtn.textContent;
            explainBtn.disabled = true;
            explainBtn.textContent = '🤖 Thinking...';
            const stored = await chrome.storage.sync.get({ explanationLanguage: 'english' });
            const lang = stored.explanationLanguage || 'english';
            const explanation = await this.getAIExplanation(this.currentHadith, 'hadith', lang);

            explainBtn.disabled = false;
            explainBtn.textContent = originalText;

            const explanationDiv = document.getElementById('hadith-explanation');
            const contentDiv = document.getElementById('hadith-explanation-content');

            if (!explanation) {
                contentDiv.innerHTML = '<div class="explain-error">Failed to generate explanation. Please try again later.</div>';
                explanationDiv.style.display = 'block';
                return;
            }

            if (typeof explanation === 'object' && explanation.status) {
                if (explanation.status === 'no_key') {
                    contentDiv.innerHTML = `
                        <div class="explain-warning">
                            <strong>Groq API key not found.</strong><br>
                            To enable AI explanations, please configure your Groq API key in the extension options.
                            <div style="margin-top:10px;">
                                <button id="open-options-for-key-hadith" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:#1a3a36; border:none; display:inline-flex; align-items:center; gap:6px;"><i data-lucide="settings"></i> Open Settings</button>
                            </div>
                        </div>`;
                    // Add click handler for the button
                    setTimeout(() => {
                        const btn = document.getElementById('open-options-for-key-hadith');
                        if (btn) btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
                    }, 50);
                } else if (explanation.status === 'auth_failed') {
                    contentDiv.innerHTML = '<div class="explain-error">Groq API authentication failed (401). Please check your API key configuration.</div>';
                } else if (explanation.status === 'api_error') {
                    contentDiv.innerHTML = `<div class="explain-error">Groq API error (${explanation.code}). Try again later.</div>`;
                } else if (explanation.status === 'network_error') {
                    contentDiv.innerHTML = '<div class="explain-error">Network error contacting Groq API. Check your connection.</div>';
                } else {
                    contentDiv.innerHTML = '<div class="explain-error">Unable to generate explanation.</div>';
                }

                explanationDiv.style.display = 'block';
                return;
            }

            contentDiv.innerHTML = explanation;
            explanationDiv.style.display = 'block';
            explanationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Error explaining Hadith:', error);
            const explanationDiv = document.getElementById('hadith-explanation');
            const contentDiv = document.getElementById('hadith-explanation-content');
            contentDiv.innerHTML = '<div class="explain-error">An error occurred while generating the explanation.</div>';
            explanationDiv.style.display = 'block';
            const explainBtn = document.getElementById('explain-hadith');
            if (explainBtn) {
                explainBtn.disabled = false;
                explainBtn.textContent = '🤖 Explain';
            }
        }
    }

    async getAIExplanation(item, type, language = 'english') {
        const proxyEndpoint = 'https://sakinah-ai-proxy.attafiahmed-dev.workers.dev';

        let prompt = '';
        let systemPrompt = '';
        
        // Add language instruction to the prompt
        const langInstruction = (language && language.toLowerCase() === 'arabic')
            ? 'CRITICAL: Respond ONLY in Arabic (العربية). Use Arabic script EXCLUSIVELY. Do NOT include ANY words from other languages (no English, no Russian, no Chinese, no French, etc.). Every single word must be in Arabic. If you need to use a technical term, use its Arabic equivalent or transliterate it into Arabic script.' 
            : 'Respond in English.';

        if (type === 'ayah') {
            systemPrompt = 'You are a knowledgeable Islamic scholar trained in Quranic tafsir, particularly following the methodology of Imam Ibn Kathir (Tafsir al-Quran al-Azim). You explain verses by: 1) Using other Quran verses as explanation (Tafsir al-Quran bil-Quran), 2) Citing authentic hadiths, 3) Referencing statements of Sahabah when relevant, 4) Providing Arabic linguistic analysis. You are humble and never fabricate references. You say "Allah knows best" when uncertain. IMPORTANT: When asked to respond in Arabic, use ONLY Arabic script and Arabic words. Never mix in words from other languages like English, Russian, Chinese, etc.';
            
            prompt = `${langInstruction}

You are explaining this Quranic verse following the methodology of Tafsir Ibn Kathir:

**Arabic Text:** ${item.arabic || ''}
**Translation:** ${item.translation || ''}
**Surah & Verse:** ${item.surah || ''} (${item.surahNumber || ''}:${item.ayahNumber || ''})

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
        } else {
            systemPrompt = 'You are a knowledgeable Islamic scholar trained in hadith sciences. You explain hadiths accurately based on classical scholarship, mentioning authenticity grades when known. You are humble and never fabricate information. Your goal is to help Muslims understand and apply prophetic teachings authentically. IMPORTANT: When asked to respond in Arabic, use ONLY Arabic script and Arabic words. Never mix in words from other languages like English, Russian, Chinese, etc.';
            
            prompt = `${langInstruction}

You are explaining this Hadith to a Muslim seeking guidance:

**Arabic Text:** ${item.arabic_text || item.arabic || ''}
**Translation:** ${item.english_translation || item.translation || item.text || ''}
**Source:** ${item.source || ''}

Please provide a thoughtful, accurate explanation following this structure:

1. **Hadith Authenticity:** If known, mention the grading (Sahih, Hasan, etc.) and the collection it comes from.

2. **Key Terms:** Explain any important Arabic words or concepts mentioned.

3. **Context:** If the occasion when the Prophet ﷺ said this is known, mention it briefly. If not known, skip this section - do not mention that it is unknown.

4. **Core Teaching:** What is the main lesson or guidance from this hadith?

5. **Practical Application:** How can a Muslim implement this teaching in their daily life?

**Important Guidelines:**
- Be accurate and truthful. If you're unsure about authenticity or context, say "Allah knows best."
- Do not invent chains of narration or fabricate historical details.
- Keep the tone warm, respectful, and spiritually uplifting.
- Aim for approximately 200-300 words.`;
        }

        try {
            const response = await fetch(proxyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.4,
                    max_completion_tokens: 1200
                })
            });

            if (response.status === 401) {
                console.error('Proxy API 401: authentication failed');
                return { status: 'auth_failed' };
            }

            if (!response.ok) {
                console.error('Proxy API error:', response.status);
                return { status: 'api_error', code: response.status };
            }

            const result = await response.json();
            const explanation = (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) ? result.choices[0].message.content : '';
            if (!explanation) {
                return { status: 'empty' };
            }

            return explanation.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>');

        } catch (error) {
            console.error('Error calling Proxy API:', error);
            return { status: 'network_error' };
        }
    }

    // Send chat message in AI Guide
    async sendChatMessage() {
        const textarea = document.getElementById('emotional-state');
        const userMessage = textarea.value.trim();
        
        if (!userMessage) {
            return;
        }

        const chatMessages = document.getElementById('chat-messages');
        const sendBtn = document.getElementById('get-guidance');
        const arabicModeToggle = document.getElementById('arabic-mode-toggle');
        const forceArabic = arabicModeToggle ? arabicModeToggle.checked : false;

        // Add user message to chat
        this.addChatMessage(userMessage, 'user');

        // Clear input
        textarea.value = '';
        document.getElementById('char-count').textContent = '0';

        // Disable send button and show loading
        sendBtn.disabled = true;
        sendBtn.textContent = '⏳';

        // Add loading indicator
        const loadingId = this.addChatMessage(forceArabic ? 'جاري التفكير...' : 'Thinking...', 'ai', true);

        try {
            // Get AI response with forceArabic option
            const result = await window.sakinahAI.getGuidance(userMessage, this.ayahData.ayahs, { forceArabic });

            // Remove loading indicator
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) loadingEl.remove();

            if (result.success) {
                // Add AI response to chat
                this.addChatMessage(result.response, 'ai');

                // If a verse was detected, show it prominently
                if (result.suggestedAyah) {
                    this.addAyahCard(result.suggestedAyah);
                }
            } else {
                // Handle errors
                let errorMessage = result.message || 'Unable to get guidance. Please try again.';
                
                if (result.error === 'no_api_key') {
                    errorMessage = '⚠️ To use the AI Guide, please configure your Groq API key in Settings → Open Advanced Settings.';
                }
                
                this.addChatMessage(errorMessage, 'ai', false, true);
            }

        } catch (error) {
            console.error('Error in chat:', error);
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) loadingEl.remove();
            this.addChatMessage('An error occurred. Please try again.', 'ai', false, true);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send 📤';
        }
    }

    // Add a message to the chat
    addChatMessage(content, sender, isLoading = false, isError = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageId = `msg-${Date.now()}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.style.marginBottom = '12px';
        messageDiv.style.display = 'flex';
        messageDiv.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';

        const isRTL = this.isArabicText(content);
        
        const bubbleStyle = sender === 'user' 
            ? 'background: linear-gradient(135deg, #72BAAE 0%, #5AA89C 100%); color: white; border-radius: 12px 12px 0 12px;'
            : `background: linear-gradient(135deg, rgba(168, 235, 216, 0.3) 0%, rgba(114, 186, 174, 0.2) 100%); color: #1a3a36; border-radius: 12px 12px 12px 0; ${isError ? 'border-left: 3px solid #ff6b6b;' : ''}`;

        // Format the content with proper paragraphs and handle Arabic
        const formattedContent = this.formatChatContent(content);

        // Add reference links for AI responses (not for user messages or loading/error states)
        const referencesHTML = (sender === 'ai' && !isLoading && !isError) ? `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(114, 186, 174, 0.2); font-size: 0.8em;">
                <div style="color: #72BAAE; font-weight: 600; margin-bottom: 6px; display:flex; align-items:center; gap:6px;"><i data-lucide="book-marked"></i> References & Sources:</div>
                <div style="line-height: 1.6; color: #495057;">
                    <a href="https://quran.com" target="_blank" style="color: #72BAAE; text-decoration: none; display: inline-block; margin-right: 12px;">🕌 Quran.com</a>
                    <a href="https://sunnah.com" target="_blank" style="color: #72BAAE; text-decoration: none; display: inline-block; margin-right: 12px;">📖 Sunnah.com</a>
                    <a href="https://www.altafsir.com" target="_blank" style="color: #72BAAE; text-decoration: none; display: inline-block; margin-right: 12px;">📝 Tafsir Library</a>
                    <a href="https://islamqa.info" target="_blank" style="color: #72BAAE; text-decoration: none; display: inline-block;">💬 Islam Q&A</a>
                </div>
                <div style="margin-top: 6px; font-size: 0.9em; color: #6c757d; font-style: italic;">
                    Verified from classical Islamic scholarship
                </div>
            </div>
        ` : '';

        messageDiv.innerHTML = `
            <div style="${bubbleStyle} padding: 12px 16px; max-width: 85%; ${isRTL ? 'direction: rtl; text-align: right;' : ''} ${isLoading ? 'font-style: italic; opacity: 0.7;' : ''}">
                ${isLoading ? '<span class="loading-dots">🤔 ' + content + '</span>' : formattedContent}
                ${referencesHTML}
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageId;
    }

    // Add an ayah card to the chat
    addAyahCard(ayah) {
        const chatMessages = document.getElementById('chat-messages');
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'chat-message ai-message';
        cardDiv.style.marginBottom = '12px';
        
        cardDiv.innerHTML = `
            <div style="background: linear-gradient(145deg, #fff 0%, #f8faf9 100%); border: 2px solid rgba(114, 186, 174, 0.3); border-radius: 12px; padding: 16px; max-width: 90%; box-shadow: 0 2px 8px rgba(114, 186, 174, 0.1);">
                <div style="font-size: 0.8em; color: #72BAAE; font-weight: 600; margin-bottom: 8px;">📖 Suggested Verse</div>
                <div style="font-family: 'Scheherazade', 'Amiri', serif; font-size: 1.2em; direction: rtl; text-align: right; color: #1a3a36; line-height: 2; margin-bottom: 12px;">
                    ${ayah.arabic || ''}
                </div>
                <div style="font-style: italic; color: #495057; line-height: 1.7; margin-bottom: 8px;">
                    "${ayah.translation || ''}"
                </div>
                <div style="font-size: 0.85em; color: #72BAAE; font-weight: 500;">
                    — ${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})
                </div>
            </div>
        `;

        chatMessages.appendChild(cardDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Format chat content with proper paragraphs
    formatChatContent(content) {
        if (!content) return '';
        
        // Convert markdown-style formatting
        let formatted = content
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks to paragraphs
            .split('\n\n').map(p => `<p style="margin: 0 0 8px 0; line-height: 1.7;">${p}</p>`).join('')
            // Single line breaks
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    // Check if text is primarily Arabic
    isArabicText(text) {
        if (!text) return false;
        const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
        return arabicChars > text.length * 0.3;
    }

    // Clear chat history
    clearChat() {
        const chatMessages = document.getElementById('chat-messages');
        
        // Clear AI guide conversation history
        if (window.sakinahAI) {
            window.sakinahAI.clearHistory();
        }

        // Reset chat to welcome message
        chatMessages.innerHTML = `
            <div class="chat-message ai-message" style="margin-bottom:12px;">
                <div style="background:linear-gradient(135deg, rgba(168, 235, 216, 0.3) 0%, rgba(114, 186, 174, 0.2) 100%); padding:12px 16px; border-radius:12px 12px 12px 0; max-width:90%;">
                    <p style="margin:0; color:#1a3a36; line-height:1.6;">
                        السلام عليكم ورحمة الله وبركاته 🤲
                    </p>
                    <p style="margin:8px 0 0 0; color:#1a3a36; line-height:1.6;">
                        Peace be upon you! I'm Sakinah, your AI spiritual guide. Share what's on your heart, and I'll help you find peace through the Quran and Islamic wisdom. How can I help you today?
                    </p>
                </div>
            </div>
        `;
    }

    // Legacy method for backward compatibility
    async getAIGuidance() {
        return this.sendChatMessage();
    }

    // Show/hide loading state
    showLoading(show) {
        document.getElementById('ayah-loading').style.display = show ? 'block' : 'none';
        document.getElementById('ayah-content').style.display = show ? 'none' : 'block';
    }

    // Show error message
    showError(message) {
        document.getElementById('ayah-loading').innerHTML = `
            <div class="error">
                <p>❌ ${message}</p>
            </div>
        `;
    }

    // Load user settings
    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get(CONFIG.DEFAULT_SETTINGS);
            this.settings = settings;

            document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
            document.getElementById('notification-frequency').value = settings.notificationInterval;
            document.getElementById('show-arabic').checked = settings.showArabic;
            document.getElementById('show-translation').checked = settings.showTranslation;

            // Update notification settings visibility
            document.getElementById('notification-settings').style.display = 
                settings.notificationsEnabled ? 'block' : 'none';

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async fetchPrayerTimes() {
        try {
            // If city and country are set in settings, use timingsByCity
            if (this.settings && this.settings.prayerCity && this.settings.prayerCountry) {
                await this.getPrayerTimesByCity(this.settings.prayerCity, this.settings.prayerCountry);
                return;
            }

            let location = await chrome.storage.local.get(['userLocation']);
            
            if (!location.userLocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    await chrome.storage.local.set({ userLocation: { lat, lng } });
                    this.getPrayerTimesFromAPI(lat, lng);
                }, (err) => {
                    console.warn('Geolocation failed, using default (Makkah):', err);
                    this.getPrayerTimesFromAPI(21.4225, 39.8262); // Makkah
                });
            } else {
                this.getPrayerTimesFromAPI(location.userLocation.lat, location.userLocation.lng);
            }
        } catch (e) {
            console.error('Error in fetchPrayerTimes:', e);
        }
    }

    async getPrayerTimesByCity(city, country) {
        try {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;
            
            const method = (this.settings && this.settings.prayerMethod) || 3;
            const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.code === 200) {
                this.updatePrayerTimesUI(data.data.timings);
                // Also update Hijri date if needed (though popup might not show it)
            }
        } catch (e) {
            console.error('Failed to fetch prayer times by city:', e);
            // Fallback to coordinates if city fetch fails
            let location = await chrome.storage.local.get(['userLocation']);
            if (location.userLocation) {
                this.getPrayerTimesFromAPI(location.userLocation.lat, location.userLocation.lng);
            }
        }
    }

    async getPrayerTimesFromAPI(lat, lng) {
        try {
            const method = (this.settings && this.settings.prayerMethod) || 3;
            const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.code === 200) {
                this.updatePrayerTimesUI(data.data.timings);
            }
        } catch (e) {
            console.error('Failed to fetch prayer times:', e);
        }
    }

    updatePrayerTimesUI(timings) {
        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let nextPrayer = null;
        let minDiff = Infinity;

        prayers.forEach(p => {
            const timeStr = timings[p];
            const el = document.getElementById(`popup-prayer-${p.toLowerCase()}`);
            if (el) {
                const timeSpan = el.querySelector('.time');
                if (timeSpan) timeSpan.textContent = timeStr;

                const [hours, minutes] = timeStr.split(':').map(Number);
                const prayerMinutes = hours * 60 + minutes;
                
                el.classList.remove('active');
                
                const diff = prayerMinutes - currentTime;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextPrayer = el;
                }
            }
        });

        if (!nextPrayer) {
            const fajrEl = document.getElementById('popup-prayer-fajr');
            if (fajrEl) fajrEl.classList.add('active');
        } else {
            nextPrayer.classList.add('active');
        }
    }

    // Toggle notifications
    async toggleNotifications(enabled) {
        try {
            await chrome.storage.sync.set({ notificationsEnabled: enabled });
            document.getElementById('notification-settings').style.display = enabled ? 'block' : 'none';

            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'toggleNotifications',
                enabled: enabled
            });

        } catch (error) {
            console.error('Error toggling notifications:', error);
        }
    }

    // Update notification frequency
    async updateNotificationFrequency(frequency) {
        try {
            await chrome.storage.sync.set({ notificationInterval: parseInt(frequency) });
            
            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'updateNotificationFrequency',
                frequency: parseInt(frequency)
            });

        } catch (error) {
            console.error('Error updating notification frequency:', error);
        }
    }

    // Update display settings
    async updateDisplaySetting(setting, value) {
        try {
            await chrome.storage.sync.set({ [setting]: value });
        } catch (error) {
            console.error('Error updating display setting:', error);
        }
    }

    // Show help modal
    showHelpModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('help-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; max-width: 400px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: #2B8C7B;">📖 Sakinah Help</h2>
                    <button id="close-help-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0;">🎲 Random Ayah</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Get a random verse from the Quran. Click "Explain" to get AI-powered insights.</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0; display:flex; align-items:center; gap:6px;"><i data-lucide="building"></i> Ahadith</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Browse prophetic traditions from various collections including Forties collections (Nawawi, etc.).</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0; display:flex; align-items:center; gap:6px;"><i data-lucide="sparkles"></i> AI Guide</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Share your feelings and get personalized spiritual guidance with relevant Quranic verses. Toggle "عربي" for Arabic responses.</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0; display:flex; align-items:center; gap:6px;"><i data-lucide="heart"></i> Favorites</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Save and review your favorite verses and hadiths. Use AI analysis to discover patterns in your selections.</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0; display:flex; align-items:center; gap:6px;"><i data-lucide="target"></i> Hifdh</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Memorize the Quran with Learn and Quiz modes. Track your progress surah by surah.</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #2B8C7B; margin: 0 0 8px 0; display:flex; align-items:center; gap:6px;"><i data-lucide="bell"></i> Notifications</h3>
                        <p style="margin: 0; color: #555; font-size: 0.9em;">Enable periodic reminders with Quranic verses. Customize frequency from 15 minutes to daily.</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(168, 235, 216, 0.2) 0%, rgba(114, 186, 174, 0.15) 100%); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <p style="margin: 0; color: #2B8C7B; font-size: 0.85em; text-align: center;">
                            <strong>Tip:</strong> Configure your Groq API key in Advanced Settings for AI features.
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Initialize Lucide icons in the modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Close handlers
        document.getElementById('close-help-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // --- Hifdh (memorization) helpers ---
    async ensureHifdhLoaded() {
        if (this.hifdhData) return;
        let raw = null;
        try {
            const response = await fetch(chrome.runtime.getURL('quran_hifdh.json'));
            raw = await response.json();
        } catch (err) {
            console.error('Error loading hifdh data:', err);
            raw = null;
        }

        // normalize into { surahs: [ { number, name?, ayahs: [...] } ] }
        let surahs = [];
        if (raw) {
            if (raw.surahs && Array.isArray(raw.surahs)) {
                surahs = raw.surahs.map(s => ({
                    number: s.number,
                    name: s.name || null,
                    ayahs: s.ayahs || []
                }));
            } else {
                // raw likely has numeric keys "1", "2", ...
                const keys = Object.keys(raw).filter(k => /^\d+$/.test(k)).sort((a,b)=>parseInt(a)-parseInt(b));
                keys.forEach(k => {
                    const arr = raw[k] || [];
                    const sNum = parseInt(k, 10);
                    const ayahs = Array.isArray(arr) ? arr.map(a => ({
                        numberInSurah: a.verse || a.verseNumber || a.ayah || a.verse || 0,
                        arabic: a.text || a.arabic || '',
                        translation: a.translation || a.trans || ''
                    })) : [];
                    surahs.push({ number: sNum, name: null, ayahs });
                });
            }
        }

        // try to load meta names (Arabic-only) and apply when names missing
        try {
            const metaResp = await fetch(chrome.runtime.getURL('quran_hifdh_meta.json'));
            const meta = await metaResp.json();
            if (meta && Array.isArray(meta.surahNames)) {
                surahs.forEach(s => {
                    if (!s.name) {
                        const idx = s.number - 1;
                        s.name = meta.surahNames[idx] || s.name || `سورة ${s.number}`;
                    }
                });
            }
        } catch (err) {
            // non-fatal; use existing names or blank
            console.warn('Could not load surah meta names:', err);
        }

        this.hifdhData = { surahs };

        // Provide the full Quran database to the AI Guide
        if (window.sakinahAI) {
            window.sakinahAI.setFullQuranDatabase(this.hifdhData);
        }

        const sel = document.getElementById('surah-select');
        if (sel && this.hifdhData && Array.isArray(this.hifdhData.surahs)) {
            sel.innerHTML = '';
            this.hifdhData.surahs.forEach((s, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                const name = s.name ? String(s.name) : '';
                opt.textContent = name ? `${s.number}. ${name}` : `${s.number}`;
                sel.appendChild(opt);
            });
            if (this.hifdhState.surahIndex === -1) this.hifdhState.surahIndex = 0;
        }

        // Load memorized state for initial surah
        this.loadHifdhMemorizedState();
    }

    // Load memorized ayahs from storage
    loadHifdhMemorizedState() {
        const key = `hifdh.progress.${this.hifdhState.surahIndex}`;
        chrome.storage.local.get([key], (res) => {
            this.hifdhState.memorized = res[key] || {};
            this.updateHifdhStatsUI();
            this.updateMarkButton();
        });
    }

    // Update stats display
    updateHifdhStatsUI() {
        const countEl = document.getElementById('memorized-count');
        if (!countEl || !this.hifdhData) return;
        
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        
        const memorizedCount = Object.values(this.hifdhState.memorized).filter(Boolean).length;
        countEl.textContent = memorizedCount;

        // Update progress bar
        const progressBar = document.getElementById('hifdh-progress-bar');
        const percentageEl = document.getElementById('hifdh-percentage');
        if (progressBar && percentageEl) {
            const percentage = s.ayahs.length > 0 ? Math.round((memorizedCount / s.ayahs.length) * 100) : 0;
            progressBar.style.width = `${percentage}%`;
            percentageEl.textContent = `${percentage}%`;
        }
    }

    // Update mark button state
    updateMarkButton() {
        const markBtn = document.getElementById('hifdh-mark');
        const markIcon = document.getElementById('hifdh-mark-icon');
        if (!markBtn || !markIcon) return;
        
        const isMemorized = this.hifdhState.memorized[this.hifdhState.ayahIndex];
        const buttonText = isMemorized ? translator.get('hifdh.memorized') : translator.get('hifdh.markMemorized');
        markIcon.textContent = isMemorized ? '✓' : '☐';
        markBtn.innerHTML = `<span id="hifdh-mark-icon">${isMemorized ? '✓' : '☐'}</span> ${buttonText}`;
        
        if (isMemorized) {
            markBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
        } else {
            markBtn.style.background = 'linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%)';
        }
    }

    // Set hifdh mode
    setHifdhMode(mode) {
        this.hifdhState.mode = mode;
        
        // Update button styles
        const modes = ['learn', 'quiz', 'listen'];
        modes.forEach(m => {
            const btn = document.getElementById(`hifdh-${m}`);
            if (btn) {
                if (m === mode) {
                    btn.style.background = 'linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%)';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#72BAAE';
                } else {
                    btn.style.background = 'white';
                    btn.style.color = '#2B8C7B';
                    btn.style.borderColor = 'rgba(114,186,174,0.3)';
                }
            }
        });

        // Show/hide relevant areas
        const quizArea = document.getElementById('hifdh-quiz-area');
        const listenArea = document.getElementById('hifdh-listen-area');
        const transBox = document.getElementById('hifdh-translation');
        const arabicBox = document.getElementById('hifdh-arabic');

        if (quizArea) quizArea.style.display = mode === 'quiz' ? 'block' : 'none';
        if (listenArea) listenArea.style.display = mode === 'listen' ? 'block' : 'none';
        
        if (transBox) {
            transBox.style.display = mode === 'quiz' ? 'none' : 'block';
            transBox.style.visibility = 'visible';
        }

        if (arabicBox) {
            arabicBox.style.display = mode === 'quiz' ? 'none' : 'block';
        }

        // Clear quiz feedback
        const feedback = document.getElementById('hifdh-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }

        // Stop any playing audio when switching modes
        if (this.hifdhAudio) {
            this.hifdhAudio.pause();
            this.hifdhAudio = null;
        }

        // Initialize quiz if entering quiz mode
        if (mode === 'quiz') {
            this.initQuizGame();
        }
    }

    // Initialize quiz game
    initQuizGame() {
        // Reset quiz state
        this.quizState = {
            score: 0,
            streak: 0,
            correctIndex: -1,
            answered: false
        };
        this.updateQuizScoreDisplay();
        this.generateQuizQuestion();
    }

    // Generate a quiz question with 3 options
    generateQuizQuestion() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s || s.ayahs.length < 3) return;

        this.quizState.answered = false;
        const currentAyah = s.ayahs[this.hifdhState.ayahIndex];
        const arabicText = currentAyah.arabic || currentAyah.text || '';

        // Split the verse into words and show first half as prompt
        const words = arabicText.split(' ');
        const promptWords = Math.max(1, Math.floor(words.length / 2));
        const promptText = words.slice(0, promptWords).join(' ');
        const answerText = words.slice(promptWords).join(' ');

        // Display the prompt (first part of verse)
        const quizPrompt = document.getElementById('quiz-prompt');
        if (quizPrompt) {
            quizPrompt.textContent = promptText;
        }

        // Get 2 random wrong answers from other ayahs
        const wrongIndices = [];
        const totalAyahs = s.ayahs.length;
        
        while (wrongIndices.length < 2) {
            const randomIdx = Math.floor(Math.random() * totalAyahs);
            if (randomIdx !== this.hifdhState.ayahIndex && !wrongIndices.includes(randomIdx)) {
                wrongIndices.push(randomIdx);
            }
        }

        // Get the second half of wrong answers too
        const getSecondHalf = (ayah) => {
            const text = ayah.arabic || ayah.text || '';
            const w = text.split(' ');
            const half = Math.max(1, Math.floor(w.length / 2));
            return w.slice(half).join(' ') || text;
        };

        // Create options array with correct answer and 2 wrong ones
        const options = [
            { text: answerText || arabicText, correct: true },
            { text: getSecondHalf(s.ayahs[wrongIndices[0]]), correct: false },
            { text: getSecondHalf(s.ayahs[wrongIndices[1]]), correct: false }
        ];

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        // Find correct index after shuffle
        this.quizState.correctIndex = options.findIndex(o => o.correct);

        // Update option buttons
        const optionBtns = document.querySelectorAll('.quiz-option');
        optionBtns.forEach((btn, idx) => {
            const textSpan = btn.querySelector('.option-text');
            if (textSpan) {
                textSpan.textContent = options[idx].text;
            }
            // Reset styles
            btn.style.background = 'white';
            btn.style.borderColor = 'rgba(114,186,174,0.3)';
            btn.style.transform = 'scale(1)';
            btn.disabled = false;
            btn.style.cursor = 'pointer';
        });

        // Hide feedback and next button
        const feedback = document.getElementById('hifdh-feedback');
        if (feedback) feedback.style.display = 'none';
        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) nextBtn.style.display = 'none';
    }

    // Handle quiz option selection
    selectQuizOption(optionIndex) {
        if (this.quizState.answered) return;
        this.quizState.answered = true;

        const optionBtns = document.querySelectorAll('.quiz-option');
        const isCorrect = optionIndex === this.quizState.correctIndex;

        // Disable all options
        optionBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
        });

        // Highlight correct answer
        optionBtns[this.quizState.correctIndex].style.background = 'linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0.1) 100%)';
        optionBtns[this.quizState.correctIndex].style.borderColor = '#28a745';
        optionBtns[this.quizState.correctIndex].style.transform = 'scale(1.02)';

        // If wrong, highlight the wrong selection
        if (!isCorrect) {
            optionBtns[optionIndex].style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.2) 0%, rgba(220, 53, 69, 0.1) 100%)';
            optionBtns[optionIndex].style.borderColor = '#dc3545';
        }

        // Update score and streak
        if (isCorrect) {
            this.quizState.score++;
            this.quizState.streak++;
            
            // Auto-mark as memorized if 3+ streak
            if (this.quizState.streak >= 3 && !this.hifdhState.memorized[this.hifdhState.ayahIndex]) {
                this.toggleMarkMemorized();
            }
        } else {
            this.quizState.streak = 0;
        }

        this.updateQuizScoreDisplay();
        this.showQuizFeedback(isCorrect);
    }

    // Update quiz score display
    updateQuizScoreDisplay() {
        const scoreEl = document.getElementById('quiz-score');
        const streakEl = document.getElementById('quiz-streak');
        
        if (scoreEl) scoreEl.textContent = this.quizState.score;
        if (streakEl) {
            streakEl.textContent = this.quizState.streak;
            // Add fire effect for high streaks
            if (this.quizState.streak >= 3) {
                streakEl.style.color = '#ff6b35';
                streakEl.style.textShadow = '0 0 10px rgba(255, 107, 53, 0.5)';
            } else {
                streakEl.style.color = '#ffc107';
                streakEl.style.textShadow = 'none';
            }
        }
    }

    // Show quiz feedback
    showQuizFeedback(isCorrect) {
        const feedback = document.getElementById('hifdh-feedback');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (!feedback) return;

        feedback.style.display = 'block';

        if (isCorrect) {
            feedback.style.background = 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(40, 167, 69, 0.05) 100%)';
            feedback.style.border = '2px solid rgba(40, 167, 69, 0.3)';
            
            const messages = [
                { icon: '🎉', key: 'hifdh.excellentMashallah' },
                { icon: '⭐', key: 'hifdh.perfectKeepGoing' },
                { icon: '🌟', key: 'hifdh.amazingGotIt' },
                { icon: '✨', key: 'hifdh.brilliantWellDone' }
            ];
            const msg = messages[Math.floor(Math.random() * messages.length)];
            
            if (feedbackIcon) feedbackIcon.textContent = msg.icon;
            if (feedbackText) {
                feedbackText.style.color = '#155724';
                feedbackText.textContent = translator.get(msg.key);
                if (this.quizState.streak >= 3) {
                    feedbackText.textContent += ` 🔥 ${this.quizState.streak} ${translator.get('hifdh.streak')}!`;
                }
            }
        } else {
            feedback.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.05) 100%)';
            feedback.style.border = '2px solid rgba(220, 53, 69, 0.3)';
            
            if (feedbackIcon) feedbackIcon.textContent = '📚';
            if (feedbackText) {
                feedbackText.style.color = '#721c24';
                feedbackText.textContent = translator.get('hifdh.notQuiteCorrect');
            }
        }

        if (nextBtn) nextBtn.style.display = 'inline-block';
    }

    // Go to next quiz question
    nextQuizQuestion() {
        // Move to next ayah
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;

        if (this.hifdhState.ayahIndex < s.ayahs.length - 1) {
            this.hifdhState.ayahIndex++;
        } else {
            // Loop back to beginning or show completion
            this.hifdhState.ayahIndex = 0;
        }

        this.saveHifdhProgress();
        this.updateHifdhProgressUI();
        this.generateQuizQuestion();
    }

    updateHifdhProgressUI() {
        const info = document.getElementById('hifdh-progress');
        const badge = document.getElementById('hifdh-verse-badge');
        if (!this.hifdhData) return;
        
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        
        const total = s.ayahs.length;
        const current = this.hifdhState.ayahIndex + 1;
        
        if (info) {
            // Get translation for "Ayah X of Y"
            const ayahText = translator.get('hifdh.ayahOf')
                .replace('{current}', current)
                .replace('{total}', total);
            info.textContent = `${s.name || 'Surah ' + s.number} — ${ayahText}`;
        }
        
        if (badge) {
            const ayahLabel = translator.get('ayah.ayah') || 'Ayah';
            badge.textContent = `${ayahLabel} ${current}`;
        }

        this.updateHifdhStatsUI();
    }

    showHifdhAyah() {
        const arabicBox = document.getElementById('hifdh-arabic');
        const transBox = document.getElementById('hifdh-translation');
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        if (!ay) return;

        // Update primary displayed text
        if (arabicBox) {
            arabicBox.textContent = ay.arabic || ay.text || '';
        }
        if (transBox) {
            transBox.textContent = ay.translation || ay.trans || '';
            transBox.style.visibility = this.hifdhState.mode === 'quiz' ? 'hidden' : 'visible';
        }

        this.updateHifdhProgressUI();
        this.updateMarkButton();

        // Clear feedback and answer when navigating
        const feedback = document.getElementById('hifdh-feedback');
        if (feedback) feedback.style.display = 'none';
        const answerBox = document.getElementById('hifdh-answer');
        if (answerBox) answerBox.value = '';
    }

    toggleHifdhMode() {
        this.showHifdhAyah();
    }

    hifdhNext() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        if (this.hifdhState.ayahIndex < s.ayahs.length - 1) {
            this.hifdhState.ayahIndex++;
            this.showHifdhAyah();
            this.saveHifdhProgress();
        }
    }

    hifdhPrev() {
        if (this.hifdhState.ayahIndex > 0) {
            this.hifdhState.ayahIndex--;
            this.showHifdhAyah();
            this.saveHifdhProgress();
        }
    }

    randomHifdhAyah() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s || s.ayahs.length === 0) return;
        
        this.hifdhState.ayahIndex = Math.floor(Math.random() * s.ayahs.length);
        this.showHifdhAyah();
        this.saveHifdhProgress();
    }

    toggleMarkMemorized() {
        const key = `hifdh.progress.${this.hifdhState.surahIndex}`;
        const idx = this.hifdhState.ayahIndex;
        
        // Toggle in local state
        this.hifdhState.memorized[idx] = !this.hifdhState.memorized[idx];
        
        // Save to storage
        const obj = {}; 
        obj[key] = this.hifdhState.memorized;
        chrome.storage.local.set(obj, () => {
            this.updateMarkButton();
            this.updateHifdhStatsUI();
        });
    }

    saveHifdhProgress() {
        const key = `hifdh.cursor.${this.hifdhState.surahIndex}`;
        const obj = {}; obj[key] = this.hifdhState.ayahIndex;
        chrome.storage.local.set(obj);
    }

    resetHifdhProgress() {
        if (!confirm('Reset all memorization progress for this Surah?')) return;
        
        const key = `hifdh.progress.${this.hifdhState.surahIndex}`;
        chrome.storage.local.remove([key], () => {
            this.hifdhState.memorized = {};
            this.updateHifdhProgressUI();
            this.updateMarkButton();
            this.updateHifdhStatsUI();
        });
    }

    revealHifdhAnswer() {
        const transBox = document.getElementById('hifdh-translation');
        const arabicBox = document.getElementById('hifdh-arabic');
        if (transBox) transBox.style.visibility = 'visible';
        if (arabicBox) arabicBox.style.visibility = 'visible';
        
        const feedback = document.getElementById('hifdh-feedback');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = 'rgba(114, 186, 174, 0.15)';
            feedback.style.color = '#2B8C7B';
            feedback.textContent = '👁️ Answer revealed - try to memorize it!';
        }
    }

    showHifdhHint() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        if (!ay) return;

        const feedback = document.getElementById('hifdh-feedback');
        if (!feedback) return;

        const arabic = ay.arabic || ay.text || '';
        const words = arabic.split(/\s+/);
        
        // Show first 2-3 words as hint
        const hintWords = words.slice(0, Math.min(3, Math.ceil(words.length / 3)));
        const hint = hintWords.join(' ') + ' ...';

        feedback.style.display = 'block';
        feedback.style.background = 'rgba(255, 193, 7, 0.15)';
        feedback.style.color = '#856404';
        feedback.innerHTML = `💡 <strong>Hint:</strong> <span style="direction:rtl; font-family:'Scheherazade', serif;">${hint}</span>`;
    }

    checkHifdhAnswer() {
        const input = document.getElementById('hifdh-answer');
        const result = document.getElementById('hifdh-feedback');
        if (!input || !result || !this.hifdhData) return;
        
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        
        // Check against both Arabic and translation
        const arabicText = (ay.arabic || ay.text || '').trim();
        const translationText = (ay.translation || ay.trans || '').trim();
        const given = input.value.trim();
        
        if (given.length === 0) {
            result.style.display = 'block';
            result.style.background = 'rgba(255, 193, 7, 0.15)';
            result.style.color = '#856404';
            result.textContent = '✏️ Please type your attempt first.';
            return;
        }

        // Calculate similarity for both
        const arabicScore = this.calculateSimilarity(arabicText, given);
        const translationScore = this.calculateSimilarity(translationText, given);
        const bestScore = Math.max(arabicScore, translationScore);
        const percentage = Math.round(bestScore * 100);

        result.style.display = 'block';

        if (bestScore >= 0.9) {
            result.style.background = 'rgba(40, 167, 69, 0.15)';
            result.style.color = '#155724';
            result.innerHTML = `🎉 <strong>Excellent!</strong> ${percentage}% match - Perfect memorization!`;
            // Auto-mark as memorized
            if (!this.hifdhState.memorized[this.hifdhState.ayahIndex]) {
                this.toggleMarkMemorized();
            }
        } else if (bestScore >= 0.7) {
            result.style.background = 'rgba(23, 162, 184, 0.15)';
            result.style.color = '#0c5460';
            result.innerHTML = `👍 <strong>Good!</strong> ${percentage}% match - Almost there!`;
        } else if (bestScore >= 0.5) {
            result.style.background = 'rgba(255, 193, 7, 0.15)';
            result.style.color = '#856404';
            result.innerHTML = `🔄 <strong>Keep trying!</strong> ${percentage}% match - You're getting there.`;
        } else {
            result.style.background = 'rgba(220, 53, 69, 0.15)';
            result.style.color = '#721c24';
            result.innerHTML = `📚 <strong>Practice more</strong> - ${percentage}% match. Try using the hint!`;
        }
    }

    calculateSimilarity(reference, input) {
        if (!reference || !input) return 0;
        
        // Normalize both strings
        const normalize = (str) => str
            .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
            .replace(/[^\w\s\u0600-\u06FF]/g, '') // Keep Arabic letters
            .toLowerCase()
            .trim();
        
        const refNorm = normalize(reference);
        const inputNorm = normalize(input);
        
        if (refNorm === inputNorm) return 1;
        
        // Word-based similarity
        const refWords = refNorm.split(/\s+/).filter(w => w.length > 0);
        const inputWords = inputNorm.split(/\s+/).filter(w => w.length > 0);
        
        if (refWords.length === 0 || inputWords.length === 0) return 0;
        
        const inputSet = new Set(inputWords);
        let matches = 0;
        refWords.forEach(w => { if (inputSet.has(w)) matches++; });
        
        return matches / Math.max(refWords.length, inputWords.length);
    }

    simpleSimilarity(a, b) {
        return this.calculateSimilarity(a, b);
    }

    mapReciterId(id) {
        const mapping = {
            'Alafasy_128kbps': 'ar.alafasy',
            'Abdul_Basit_Murattal_192kbps': 'ar.abdulbasit',
            'Abdurrahmaan_As-Sudais_192kbps': 'ar.sudais',
            'Maher_AlMuaiqly_64kbps': 'ar.mahermuaiqly',
            'Minshawi_Murattal_128kbps': 'ar.minshawi',
            'Ahmed_ibn_Ali_al-Ajamy_128kbps': 'ar.ahmedajamy',
            'Ghamadi_40kbps': 'ar.alafasy'
        };
        return mapping[id] || id;
    }

    // Audio playback for Listen mode
    async playHifdhAudio() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        if (!ay) return;

        const statusEl = document.getElementById('hifdh-audio-status');
        const reciterSelect = document.getElementById('hifdh-reciter');
        const reciter = this.mapReciterId(reciterSelect ? reciterSelect.value : 'ar.alafasy');
        const playBtn = document.getElementById('hifdh-play');

        // Get verse number
        const verseNum = ay.numberInSurah || ay.verse || (this.hifdhState.ayahIndex + 1);
        const surahNum = s.number;

        // Format for API: surah:ayah
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${this.getAyahNumber(surahNum, verseNum)}.mp3`;

        if (statusEl) statusEl.textContent = '🔄 Loading audio...';
        if (playBtn) playBtn.textContent = '⏳ Loading...';

        try {
            // Stop previous audio
            if (this.hifdhAudio) {
                this.hifdhAudio.pause();
            }

            this.hifdhAudio = new Audio(audioUrl);
            
            this.hifdhAudio.onplay = () => {
                if (statusEl) statusEl.textContent = '🔊 Playing...';
                if (playBtn) playBtn.textContent = '⏸️ Pause';
            };
            
            this.hifdhAudio.onended = () => {
                if (statusEl) statusEl.textContent = '✓ Finished';
                if (playBtn) playBtn.textContent = '▶️ Play';
            };
            
            this.hifdhAudio.onerror = () => {
                if (statusEl) statusEl.textContent = '❌ Audio not available';
                if (playBtn) playBtn.textContent = '▶️ Play';
            };

            await this.hifdhAudio.play();
        } catch (err) {
            console.error('Error playing audio:', err);
            if (statusEl) statusEl.textContent = '❌ Could not play audio';
            if (playBtn) playBtn.textContent = '▶️ Play';
        }
    }

    repeatHifdhAudio() {
        if (this.hifdhAudio) {
            this.hifdhAudio.currentTime = 0;
            this.hifdhAudio.play();
        } else {
            this.playHifdhAudio();
        }
    }

    // Calculate absolute ayah number for audio API
    getAyahNumber(surahNum, verseNum) {
        // This is an approximation - the API uses absolute ayah numbers
        // For accurate mapping, we'd need a lookup table
        const ayahCounts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
        
        let absoluteNum = 0;
        for (let i = 0; i < surahNum - 1 && i < ayahCounts.length; i++) {
            absoluteNum += ayahCounts[i];
        }
        absoluteNum += verseNum;
        
        return absoluteNum;
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SakinahPopup();
    initResizeHandle();
    initLanguageToggle();
});

// Initialize language toggle functionality
function initLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Set active button based on current language
    const updateActiveButton = () => {
        const currentLang = translator.getCurrentLanguage();
        langButtons.forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };
    
    // Initialize active state
    updateActiveButton();
    
    // Add click handlers
    langButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const newLang = btn.dataset.lang;
            await translator.setLanguage(newLang);
            updateActiveButton();
        });
    });
    
    // Listen for language changes from other parts of the extension
    document.addEventListener('languageChanged', () => {
        updateActiveButton();
        // Reinitialize Lucide icons after language change
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        // Refresh dynamic content with new translations
        if (typeof app !== 'undefined') {
            // Refresh favorites if visible
            const favTab = document.getElementById('favorites-tab');
            if (favTab && favTab.style.display !== 'none') {
                app.displayFavorites();
            }
            // Refresh hifdh UI if visible
            const hifdhTab = document.getElementById('hifdh-tab');
            if (hifdhTab && hifdhTab.style.display !== 'none') {
                app.updateHifdhProgressUI();
            }
        }
    });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotificationAyah') {
        // Display the ayah that was shown in notification
        console.log('Notification ayah:', request.ayah);
    }
});

// Resize functionality for the popup
function initResizeHandle() {
    const resizeHandle = document.querySelector('.resize-handle');
    if (!resizeHandle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = document.body.offsetWidth;
        startHeight = document.body.offsetHeight;
        
        document.body.style.cursor = 'nwse-resize';
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newWidth = Math.max(400, Math.min(800, startWidth + deltaX));
        const newHeight = Math.max(520, Math.min(900, startHeight + deltaY));
        
        document.body.style.width = newWidth + 'px';
        document.body.style.height = newHeight + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}