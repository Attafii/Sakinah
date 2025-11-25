// popup.js - Main popup functionality

class SakinahPopup {
    constructor() {
        this.currentTab = 'random';
        this.ayahData = null;
        this.init();
    }

    async init() {
        await this.loadQuranData();
        this.setupEventListeners();
        this.loadSettings();
        this.showRandomAyah();
        this.loadFavorites();
        // hadith state
        this.hadithData = null;
        this.currentHadithIndex = -1;
        // hifdh (memorization) state
        this.hifdhData = null;
        this.hifdhState = {
            surahIndex: -1,
            ayahIndex: 0,
            mode: 'learn' // 'learn' or 'quiz'
        };
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
        if (guidanceBtn) guidanceBtn.addEventListener('click', () => this.getAIGuidance());

        // Character count for textarea
        const textarea = document.getElementById('emotional-state');
        const charCount = document.getElementById('char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length;
            });
        }

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

        // Test Notification button (sends a message to background to show a random ayah notification)
        const testNotificationBtn = document.getElementById('test-notification');
        if (testNotificationBtn) testNotificationBtn.addEventListener('click', async () => {
            try {
                // Update button to show loading state
                const originalText = testNotificationBtn.textContent;
                testNotificationBtn.textContent = '⏳ Sending...';
                testNotificationBtn.disabled = true;

                chrome.runtime.sendMessage({ action: 'showRandomAyah' }, (resp) => {
                    if (chrome.runtime.lastError) {
                        // This is expected if service worker needs to wake up
                        console.log('Test notification note:', chrome.runtime.lastError.message);
                    }
                    
                    // Show success regardless - the Windows notification will appear
                    // The in-browser notification only works on regular web pages
                    testNotificationBtn.textContent = '✅ Sent!';
                    testNotificationBtn.title = 'Windows notification sent! In-browser notification requires an open web page.';
                    setTimeout(() => {
                        testNotificationBtn.textContent = originalText;
                        testNotificationBtn.disabled = false;
                        testNotificationBtn.title = '';
                    }, 2500);
                });
            } catch (err) {
                console.error('Error requesting test notification:', err);
                testNotificationBtn.textContent = '❌ Error';
                setTimeout(() => {
                    testNotificationBtn.textContent = 'Test Notification';
                    testNotificationBtn.disabled = false;
                }, 2000);
            }
        });

        // Export Data placeholder (or real export of favorites)
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportFavorites());

        // Help placeholder
        const helpBtn = document.getElementById('help-button');
        if (helpBtn) helpBtn.addEventListener('click', () => alert('Help is coming soon — this will include usage tips and FAQs.'));

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

        // Hifdh UI elements
        const surahSelect = document.getElementById('surah-select');
        if (surahSelect) surahSelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            this.hifdhState.surahIndex = idx;
            this.hifdhState.ayahIndex = 0;
            this.updateHifdhProgressUI();
            this.ensureHifdhLoaded().then(() => this.showHifdhAyah());
        });

        const hLearn = document.getElementById('hifdh-learn');
        if (hLearn) hLearn.addEventListener('click', () => { this.hifdhState.mode = 'learn'; this.toggleHifdhMode(); });
        const hQuiz = document.getElementById('hifdh-quiz');
        if (hQuiz) hQuiz.addEventListener('click', () => { this.hifdhState.mode = 'quiz'; this.toggleHifdhMode(); });
        const hReset = document.getElementById('hifdh-reset');
        if (hReset) hReset.addEventListener('click', () => this.resetHifdhProgress());

        const hPrev = document.getElementById('hifdh-prev');
        if (hPrev) hPrev.addEventListener('click', () => this.hifdhPrev());
        const hNext = document.getElementById('hifdh-next');
        if (hNext) hNext.addEventListener('click', () => this.hifdhNext());
        const hMark = document.getElementById('hifdh-mark');
        if (hMark) hMark.addEventListener('click', () => this.toggleMarkMemorized());

        const hCheck = document.getElementById('hifdh-check');
        if (hCheck) hCheck.addEventListener('click', () => this.checkHifdhAnswer());
        const hReveal = document.getElementById('hifdh-reveal');
        if (hReveal) hReveal.addEventListener('click', () => this.revealHifdhAnswer());
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

    // Show a random hadith
    showRandomHadith() {
        if (!this.hadithData || this.hadithData.length === 0) return;
        
        // Show loading state
        const contentEl = document.getElementById('hadith-content');
        const loadingEl = document.getElementById('hadith-loading');
        if (contentEl) contentEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'block';
        
        const idx = Math.floor(Math.random() * this.hadithData.length);
        this.currentHadithIndex = idx;
        
        // Small delay for better UX like ayah
        setTimeout(() => {
            this.displayHadith(this.hadithData[idx]);
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
            saveBtn.innerHTML = '🤍';
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
                    saveBtn.innerHTML = '❤️';
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
                saveBtn.innerHTML = '❤️';
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
                saveBtn.innerHTML = '🤍';
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
                    saveBtn.innerHTML = '❤️';
                    saveBtn.classList.add('saved');
                }
                return;
            }

            favorites.unshift(this.currentAyah);
            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            
            // Visual feedback - heart animation
            if (saveBtn) {
                saveBtn.innerHTML = '❤️';
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
                    <h3 style="color:#2B8C7B; display:flex; align-items:center; gap:8px;">❤️ Your Favorites</h3>
                    <div id="favorites-analysis-result" style="display:none; background:linear-gradient(135deg, rgba(168, 235, 216, 0.2) 0%, rgba(114, 186, 174, 0.15) 100%); padding:18px; border-radius:12px; margin-bottom:16px; border-left:4px solid #72BAAE;">
                        <h4 style="margin:0 0 12px 0; color:#2B8C7B;">📊 Your Spiritual Journey</h4>
                        <div id="analysis-content"></div>
                        <div style="margin-top:12px; display:flex; gap:8px;">
                            <button id="regenerate-analysis" class="secondary-button">🔄 Regenerate</button>
                            <button id="close-analysis" class="secondary-button">✖ Close</button>
                        </div>
                    </div>
                    <div id="favorites-list" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;"></div>
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button id="analyze-favorites" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:white; border:none;">🧠 Analyze Favorites</button>
                        <button id="export-favorites" class="secondary-button">📤 Export</button>
                        <button id="clear-favorites" class="secondary-button">🗑️ Clear All</button>
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
            listRoot.innerHTML = '<div class="empty-favorites" style="text-align:center; padding:40px 20px; color:#6c757d;"><span style="font-size:3em; display:block; margin-bottom:16px; opacity:0.5;">🤍</span><p>No favorites yet.<br>Tap the heart icon to save Ayahs for later reflection.</p></div>';
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
                    <div style="font-weight:600; color:#2B8C7B;">💬 Hadith • ${ayah.source}</div>
                    <div style="margin-top:8px; font-style:italic; direction:rtl; font-family:'Amiri', serif;">${ayah.arabic_text}</div>
                    <div style="margin-top:8px; color:#495057; line-height:1.7;">${ayah.english_translation}</div>
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="open">📖 Open</button>
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="remove" style="color:#ee5253;">💔 Remove</button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div style="font-weight:600; color:#2B8C7B;">📖 ${ayah.surah || 'Ayah'} ${ayah.surahNumber ? '('+ayah.surahNumber+':'+ayah.ayahNumber+')' : ''}</div>
                    <div style="margin-top:8px; font-style:italic; color:#495057; line-height:1.7;">${ayah.translation || ayah.english_translation || ''}</div>
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.id}" data-action="open">📖 Open</button>
                        <button class="secondary-button" data-id="${ayah.id}" data-action="remove" style="color:#ee5253;">💔 Remove</button>
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

            // Show loading state
            const analyzeBtn = document.getElementById('analyze-favorites');
            const originalText = analyzeBtn.textContent;
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = '🤖 AI is analyzing your spiritual journey...';

            // Perform AI analysis (always uses LLM with hardcoded key)
            const result = await window.FavoritesAnalyzer.analyzeFavorites(favorites);

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
            ? '<span style="background:#4CAF50; color:white; padding:4px 8px; border-radius:4px; font-size:0.8em;">🤖 AI-Powered</span>'
            : '<span style="background:#2196F3; color:white; padding:4px 8px; border-radius:4px; font-size:0.8em;">📊 Offline Analysis</span>';
        
        html += `<div style="margin-bottom:12px;">${methodBadge}</div>`;

        // Interests
        if (analysis.interests) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2;">🎯 Your Interests</h5>
                    <p style="margin:0; line-height:1.6;">${analysis.interests}</p>
                </div>
            `;
        }

        // Needs
        if (analysis.needs) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2;">💭 Spiritual Needs</h5>
                    <p style="margin:0; line-height:1.6;">${analysis.needs}</p>
                </div>
            `;
        }

        // Meaning
        if (analysis.meaning) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2;">✨ Meaning & Synthesis</h5>
                    <p style="margin:0; line-height:1.6; font-style:italic;">${analysis.meaning}</p>
                </div>
            `;
        }

        // Actions
        if (analysis.actions && analysis.actions.length > 0) {
            html += `
                <div style="margin-bottom:16px;">
                    <h5 style="margin:0 0 8px 0; color:#1976d2;">🎯 Suggested Actions</h5>
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
            explainBtn.textContent = '🤖 Thinking...';
            // Load explanation language preference and request explanation
            const stored = await chrome.storage.sync.get({ explanationLanguage: 'english' });
            const lang = stored.explanationLanguage || 'english';
            const explanation = await this.getAIExplanation(this.currentAyah, 'ayah', lang);

            explainBtn.disabled = false;
            explainBtn.textContent = originalText;

            const explanationDiv = document.getElementById('ayah-explanation');
            const contentDiv = document.getElementById('ayah-explanation-content');

            if (!explanation) {
                contentDiv.innerHTML = '<div class="explain-error">Failed to generate explanation. Please try again later.</div>';
                explanationDiv.style.display = 'block';
                return;
            }

            if (typeof explanation === 'object' && explanation.status) {
                if (explanation.status === 'no_key') {
                    contentDiv.innerHTML = '<div class="explain-warning"><strong>Groq API key not found.</strong><br>To enable AI explanations, please configure your Groq API key in the extension options.<div style="margin-top:10px;"><button id="open-options-for-key" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:#1a3a36; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">⚙️ Open Settings</button></div></div>';
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
                                <button id="open-options-for-key-hadith" class="secondary-button" style="background:linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%); color:#1a3a36; border:none;">⚙️ Open Settings</button>
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
        const apiKey = (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.GROQ_API_KEY) ? CONFIG.GROQ_API_KEY : '';
        const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

        // If no key, return structured status so callers can show inline guidance
        if (!apiKey || apiKey === 'GROQ_API_KEY') {
            return { status: 'no_key' };
        }

        let prompt = '';
        // Add language instruction to the prompt
        const langInstruction = (language && language.toLowerCase() === 'arabic')
            ? 'Respond in Arabic (العربية).' : 'Respond in English.';

        if (type === 'ayah') {
            prompt = `${langInstruction} As an Islamic scholar, please provide a concise, thoughtful explanation of this Quranic verse:\n\nArabic: ${item.arabic || ''}\nTranslation: ${item.translation || ''}\nSource: ${item.surah || ''} (${item.surahNumber || ''}:${item.ayahNumber || ''})\n\nPlease explain context, key meanings, modern application, and practical steps (short).`;
        } else {
            prompt = `${langInstruction} As an Islamic scholar, provide a concise, thoughtful explanation of this Hadith:\n\nArabic: ${item.arabic_text || item.arabic || ''}\nTranslation: ${item.english_translation || item.translation || item.text || ''}\nSource: ${item.source || ''}\n\nExplain context, teachings, modern application, and practical steps (short).`;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are a knowledgeable Islamic scholar who explains Quranic verses and Hadith with clarity, warmth, and actionable guidance.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1200
                })
            });

            if (response.status === 401) {
                console.error('Groq API 401: invalid API key');
                return { status: 'auth_failed' };
            }

            if (!response.ok) {
                console.error('Groq API error:', response.status);
                return { status: 'api_error', code: response.status };
            }

            const result = await response.json();
            const explanation = (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) ? result.choices[0].message.content : '';
            if (!explanation) {
                return { status: 'empty' };
            }

            return explanation.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>');

        } catch (error) {
            console.error('Error calling Groq API:', error);
            return { status: 'network_error' };
        }
    }

    // Get AI guidance based on emotional state
    async getAIGuidance() {
        const emotionalState = document.getElementById('emotional-state').value.trim();
        
        if (!emotionalState) {
            alert('Please describe how you\'re feeling first.');
            return;
        }

        document.getElementById('get-guidance').disabled = true;
        document.getElementById('get-guidance').textContent = 'Finding guidance...';

        try {
            // Use AI logic to find relevant ayah
            const guidanceResult = await window.AIGuide.findRelevantAyah(emotionalState, this.ayahData.ayahs);
            
            if (guidanceResult) {
                this.displayAyah(guidanceResult.ayah, 'ai');
                document.getElementById('ai-explanation').textContent = guidanceResult.explanation;
                document.getElementById('ai-result').style.display = 'block';

                // Show detected emotions as clickable chips if provided
                const detectedContainer = document.getElementById('ai-detected');
                const chipsRoot = document.getElementById('ai-detected-chips');
                chipsRoot.innerHTML = '';

                if (guidanceResult.detectedEmotions && guidanceResult.detectedEmotions.length > 0) {
                    guidanceResult.detectedEmotions.forEach(item => {
                        const emotion = item.emotion || item;
                        const confidence = (item.confidence !== undefined) ? item.confidence : null;

                        const chip = document.createElement('button');
                        chip.className = 'emotion-chip';
                        chip.style.padding = '6px 8px';
                        chip.style.border = 'none';
                        chip.style.borderRadius = '14px';
                        chip.style.background = '#e6f2ff';
                        chip.style.color = '#034e7b';
                        chip.style.cursor = 'pointer';
                        chip.style.fontSize = '0.85em';
                        chip.textContent = confidence ? `${emotion} (${(confidence).toFixed(2)})` : emotion;
                        chip.dataset.emotion = emotion;

                        chip.addEventListener('click', () => {
                            this.findByEmotion(emotion);
                        });

                        chipsRoot.appendChild(chip);
                    });

                    detectedContainer.style.display = 'block';
                } else {
                    detectedContainer.style.display = 'none';
                }
            } else {
                alert('Unable to find relevant guidance. Please try rephrasing your emotional state.');
            }
        } catch (error) {
            console.error('Error getting AI guidance:', error);
            alert('Error getting guidance. Please try again.');
        } finally {
            document.getElementById('get-guidance').disabled = false;
            document.getElementById('get-guidance').textContent = 'Find Guidance';
        }
    }

    // Find guidance specifically for a single emotion keyword (used when clicking a detected emotion)
    async findByEmotion(emotionKeyword) {
        try {
            document.getElementById('get-guidance').disabled = true;
            document.getElementById('get-guidance').textContent = 'Finding guidance...';

            const guidanceResult = await window.AIGuide.findRelevantAyah(emotionKeyword, this.ayahData.ayahs);

            if (guidanceResult) {
                this.displayAyah(guidanceResult.ayah, 'ai');
                document.getElementById('ai-explanation').textContent = guidanceResult.explanation;
                document.getElementById('ai-result').style.display = 'block';

                // Update detected chips to highlight selected
                const chipsRoot = document.getElementById('ai-detected-chips');
                chipsRoot.querySelectorAll('button').forEach(btn => {
                    if (btn.dataset.emotion === emotionKeyword) {
                        btn.style.background = '#cfe9ff';
                    } else {
                        btn.style.background = '#e6f2ff';
                    }
                });
            } else {
                alert('No verse found for that emotion.');
            }
        } catch (err) {
            console.error('Error finding by emotion:', err);
            alert('Error finding guidance.');
        } finally {
            document.getElementById('get-guidance').disabled = false;
            document.getElementById('get-guidance').textContent = 'Find Guidance';
        }
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
            const settings = await chrome.storage.sync.get({
                notificationsEnabled: false,
                notificationFrequency: 60,
                showArabic: true,
                showTranslation: true
            });

            document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
            document.getElementById('notification-frequency').value = settings.notificationFrequency;
            document.getElementById('show-arabic').checked = settings.showArabic;
            document.getElementById('show-translation').checked = settings.showTranslation;

            // Update notification settings visibility
            document.getElementById('notification-settings').style.display = 
                settings.notificationsEnabled ? 'block' : 'none';

        } catch (error) {
            console.error('Error loading settings:', error);
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
            await chrome.storage.sync.set({ notificationFrequency: parseInt(frequency) });
            
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
    }

    updateHifdhProgressUI() {
        const info = document.getElementById('hifdh-progress');
        if (!info || !this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        const total = s ? s.ayahs.length : 0;
        info.textContent = `Surah ${s.number} • ${s.name} — Ayah ${this.hifdhState.ayahIndex + 1} / ${total}`;
    }

    showHifdhAyah() {
        const arabicBox = document.getElementById('hifdh-arabic');
        const transBox = document.getElementById('hifdh-translation');
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        if (!ay) return;

        const numberInSurah = ay.numberInSurah || ay.verse || ay.verseNumber || (this.hifdhState.ayahIndex + 1);

        // Update primary displayed text
        if (arabicBox) arabicBox.textContent = ay.arabic || ay.text || '';
        if (transBox) {
            transBox.textContent = ay.translation || ay.trans || '';
            transBox.style.visibility = this.hifdhState.mode === 'quiz' ? 'hidden' : 'visible';
        }

        // Update progress / reference area (uses existing ID in popup.html)
        const info = document.getElementById('hifdh-progress');
        const total = s ? s.ayahs.length : 0;
        if (info) info.textContent = `Surah ${s.number} • ${s.name} — Ayah ${this.hifdhState.ayahIndex + 1} / ${total} • Ref ${s.number}:${numberInSurah}`;

        this.updateHifdhProgressUI();
        const quizArea = document.getElementById('hifdh-quiz-area');
        if (quizArea) quizArea.style.display = (this.hifdhState.mode === 'quiz') ? 'block' : 'none';
    }

    toggleHifdhMode() {
        this.showHifdhAyah();
    }

    hifdhNext() {
        if (!this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        if (!s) return;
        if (this.hifdhState.ayahIndex < s.ayahs.length - 1) this.hifdhState.ayahIndex++;
        this.showHifdhAyah();
        this.saveHifdhProgress();
    }

    hifdhPrev() {
        if (this.hifdhState.ayahIndex > 0) this.hifdhState.ayahIndex--;
        this.showHifdhAyah();
        this.saveHifdhProgress();
    }

    toggleMarkMemorized() {
        const key = `hifdh.progress.${this.hifdhState.surahIndex}`;
        chrome.storage.local.get([key], (res) => {
            const prog = res[key] || {};
            const idx = this.hifdhState.ayahIndex;
            prog[idx] = !prog[idx];
            const obj = {}; obj[key] = prog;
            chrome.storage.local.set(obj, () => { this.updateHifdhProgressUI(); });
        });
    }

    saveHifdhProgress() {
        const key = `hifdh.cursor.${this.hifdhState.surahIndex}`;
        const obj = {}; obj[key] = this.hifdhState.ayahIndex;
        chrome.storage.local.set(obj);
    }

    resetHifdhProgress() {
        const key = `hifdh.progress.${this.hifdhState.surahIndex}`;
        chrome.storage.local.remove([key], () => { this.updateHifdhProgressUI(); });
    }

    revealHifdhAnswer() {
        const transBox = document.getElementById('hifdh-translation');
        if (transBox) transBox.style.visibility = 'visible';
    }

    checkHifdhAnswer() {
        const input = document.getElementById('hifdh-answer');
        const result = document.getElementById('hifdh-feedback');
        if (!input || !result || !this.hifdhData) return;
        const s = this.hifdhData.surahs[this.hifdhState.surahIndex];
        const ay = s.ayahs[this.hifdhState.ayahIndex];
        const expected = (ay.translation || ay.text || ay.arabic || '').replace(/[^\w\s]|_/g, '').toLowerCase().trim();
        const given = input.value.replace(/[^\w\s]|_/g, '').toLowerCase().trim();
        if (expected.length === 0) { result.textContent = 'No reference text available.'; return; }
        if (given.length === 0) { result.textContent = 'Please type your attempt.'; return; }
        const score = this.simpleSimilarity(expected, given);
        result.textContent = score > 0.7 ? `Good — similarity ${Math.round(score*100)}%` : `Try again — similarity ${Math.round(score*100)}%`;
        if (score > 0.8) this.toggleMarkMemorized();
    }

    simpleSimilarity(a, b) {
        if (!a || !b) return 0;
        const aWords = a.split(/\s+/);
        const bWords = b.split(/\s+/);
        let matches = 0;
        const setB = new Set(bWords);
        aWords.forEach(w => { if (setB.has(w)) matches++; });
        return matches / Math.max(aWords.length, bWords.length);
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SakinahPopup();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotificationAyah') {
        // Display the ayah that was shown in notification
        console.log('Notification ayah:', request.ayah);
    }
});