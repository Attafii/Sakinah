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
        if (testNotificationBtn) testNotificationBtn.addEventListener('click', () => {
            try {
                chrome.runtime.sendMessage({ action: 'showRandomAyah' }, (resp) => {
                    // Optional feedback
                    if (chrome.runtime.lastError) {
                        console.warn('Test notification message error:', chrome.runtime.lastError.message);
                        alert('Unable to send test notification message. Check background console for details.');
                    } else {
                        alert('Test notification requested. Check your notifications and background console.');
                    }
                });
            } catch (err) {
                console.error('Error requesting test notification:', err);
                alert('Failed to request test notification.');
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

        // Hadith search and navigation
        const hadithSearch = document.getElementById('hadith-search');
        if (hadithSearch) {
            let debounce = null;
            hadithSearch.addEventListener('input', (e) => {
                if (debounce) clearTimeout(debounce);
                debounce = setTimeout(() => this.searchHadiths(e.target.value.trim()), 250);
            });
        }

        const prevBtn = document.getElementById('hadith-prev');
        if (prevBtn) prevBtn.addEventListener('click', () => this.showPrevHadith());
        const nextBtn = document.getElementById('hadith-next');
        if (nextBtn) nextBtn.addEventListener('click', () => this.showNextHadith());
        const rndBtn = document.getElementById('hadith-random');
        if (rndBtn) rndBtn.addEventListener('click', () => this.showRandomHadith());
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
            const list = document.getElementById('hadith-list');
            if (list) list.innerHTML = '<div style="color:#c00">Failed to load Ahadith data.</div>';
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
        const idx = Math.floor(Math.random() * this.hadithData.length);
        this.currentHadithIndex = idx;
        this.displayHadith(this.hadithData[idx]);
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
        // When a hadith is displayed, also ensure it is shown in the hadith list area as a focused card
        // For now, show a simple highlighted card at the top
        const listRoot = document.getElementById('hadith-list');
        if (!listRoot) return;

        // create a full view
        const full = document.createElement('div');
        full.className = 'hadith-full';
        full.style.padding = '12px';
        full.style.border = '1px solid #ddd';
        full.style.borderRadius = '8px';
        full.innerHTML = `
            <div style="direction:rtl; font-size:1.15em; font-family: 'Scheherazade', serif;">${hadith.arabic_text}</div>
            <div style="margin-top:8px;">${hadith.english_translation}</div>
            <div style="margin-top:8px; color:#666; font-size:0.85em;">${hadith.source} • ${hadith.book || ''}</div>
        `;

        // clear and show
        listRoot.innerHTML = '';
        listRoot.appendChild(full);

        // track currentHadith for save
        this.currentHadith = hadith;
    }

    // Save hadith to favorites
    async saveCurrentHadithToFavorites() {
        if (!this.currentHadith) {
            alert('No Hadith selected to save.');
            return;
        }

        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];

            const exists = favorites.some(f => f.type === 'hadith' && f.hadith_id === this.currentHadith.hadith_id);
            if (exists) {
                alert('This Hadith is already in your favorites.');
                return;
            }

            const entry = Object.assign({ type: 'hadith' }, this.currentHadith);
            favorites.unshift(entry);
            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            alert('Saved Hadith to favorites.');
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

        try {
            const storage = await chrome.storage.local.get({ favorites: [] });
            const favorites = storage.favorites || [];

            // Avoid duplicates by id
            const exists = favorites.some(f => f.id === this.currentAyah.id);
            if (exists) {
                alert('This Ayah is already in your favorites.');
                return;
            }

            favorites.unshift(this.currentAyah);
            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
            alert('Saved to favorites.');
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
                    <h3>Your Favorites</h3>
                    <div id="favorites-analysis-result" style="display:none; background:#f0f8ff; padding:16px; border-radius:10px; margin-bottom:16px;">
                        <h4 style="margin:0 0 12px 0; color:#1976d2;">📊 Your Spiritual Journey</h4>
                        <div id="analysis-content"></div>
                        <div style="margin-top:12px; display:flex; gap:8px;">
                            <button id="regenerate-analysis" class="secondary-button">🔄 Regenerate</button>
                            <button id="close-analysis" class="secondary-button">✖ Close</button>
                        </div>
                    </div>
                    <div id="favorites-list" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;"></div>
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button id="analyze-favorites" class="secondary-button" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white;">🧠 Analyze Favorites</button>
                        <button id="export-favorites" class="secondary-button">Export Favorites</button>
                        <button id="clear-favorites" class="secondary-button">Clear Favorites</button>
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
            listRoot.innerHTML = '<div style="color:#666">No favorites yet. Save Ayahs you like for later reflection.</div>';
            return;
        }

        favorites.forEach(ayah => {
            const item = document.createElement('div');
            item.className = 'ayah-container';
            item.style.padding = '12px';
            item.style.borderLeft = '4px solid #ffc107';

            if (ayah.type === 'hadith') {
                item.innerHTML = `
                    <div style="font-weight:600;">Hadith • ${ayah.source}</div>
                    <div style="margin-top:6px; font-style:italic; direction:rtl;">${ayah.arabic_text}</div>
                    <div style="margin-top:6px;">${ayah.english_translation}</div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="open">Open</button>
                        <button class="secondary-button" data-id="${ayah.hadith_id}" data-action="remove">Remove</button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div style="font-weight:600;">${ayah.surah || 'Ayah'} ${ayah.surahNumber ? '('+ayah.surahNumber+':'+ayah.ayahNumber+')' : ''}</div>
                    <div style="margin-top:6px; font-style:italic;">${ayah.translation || ayah.english_translation || ''}</div>
                    <div style="margin-top:8px; display:flex; gap:8px;">
                        <button class="secondary-button" data-id="${ayah.id}" data-action="open">Open</button>
                        <button class="secondary-button" data-id="${ayah.id}" data-action="remove">Remove</button>
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

            // Remove by matching ayah id OR hadith_id (string)
            favorites = favorites.filter(f => {
                if (!id) return true;
                if (typeof id === 'string') {
                    return !(f.hadith_id === id || f.hadith_id === String(id));
                }
                const numericId = parseInt(id, 10);
                return !(f.id === numericId || f.ayahId === numericId);
            });

            await chrome.storage.local.set({ favorites });
            this.renderFavorites(favorites);
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

            const explanation = await this.getAIExplanation(this.currentAyah, 'ayah');

            explainBtn.disabled = false;
            explainBtn.textContent = originalText;

            if (explanation) {
                const explanationDiv = document.getElementById('ayah-explanation');
                const contentDiv = document.getElementById('ayah-explanation-content');
                contentDiv.innerHTML = explanation;
                explanationDiv.style.display = 'block';
                explanationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert('Failed to generate explanation. Please try again.');
            }
        } catch (error) {
            console.error('Error explaining Ayah:', error);
            alert('An error occurred while generating the explanation.');
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

            const explanation = await this.getAIExplanation(this.currentHadith, 'hadith');

            explainBtn.disabled = false;
            explainBtn.textContent = originalText;

            if (explanation) {
                const explanationDiv = document.getElementById('hadith-explanation');
                const contentDiv = document.getElementById('hadith-explanation-content');
                contentDiv.innerHTML = explanation;
                explanationDiv.style.display = 'block';
                explanationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert('Failed to generate explanation. Please try again.');
            }
        } catch (error) {
            console.error('Error explaining Hadith:', error);
            alert('An error occurred while generating the explanation.');
            const explainBtn = document.getElementById('explain-hadith');
            if (explainBtn) {
                explainBtn.disabled = false;
                explainBtn.textContent = '🤖 Explain';
            }
        }
    }

    async getAIExplanation(item, type) {
        const apiKey = CONFIG.GROQ_API_KEY;
        const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

        let prompt = '';
        if (type === 'ayah') {
            prompt = `As an Islamic scholar, please provide a detailed, thoughtful explanation of this Quranic verse:

Arabic: ${item.arabic}
Translation: ${item.translation}
Source: ${item.surah} (${item.surahNumber}:${item.ayahNumber})

Please explain:
1. The context and revelation circumstances (if known)
2. The key meanings and lessons
3. How this verse applies to modern life
4. Practical ways to implement its teachings

Provide a warm, accessible explanation that helps deepen understanding and connection to this verse.`;
        } else {
            prompt = `As an Islamic scholar, please provide a detailed, thoughtful explanation of this Hadith:

Arabic: ${item.arabic_text || item.arabic || ''}
Translation: ${item.english_translation || item.translation || item.text || ''}
Source: ${item.source}
Narrator: ${item.narrator || 'Not specified'}

Please explain:
1. The context and background of this Hadith
2. The key teachings and wisdom it contains
3. How Muslims can apply this in daily life
4. The practical spiritual and moral lessons

Provide a warm, accessible explanation that helps deepen understanding of the Prophet's (peace be upon him) guidance.`;
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
                        {
                            role: 'system',
                            content: 'You are a knowledgeable Islamic scholar who explains Quranic verses and Hadith with clarity, depth, and warmth. Your explanations are accessible, meaningful, and help people connect with Islamic teachings in their daily lives.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1200
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            const explanation = result.choices[0].message.content;

            // Format the explanation with paragraphs
            return explanation.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>');

        } catch (error) {
            console.error('Error calling Groq API:', error);
            return null;
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