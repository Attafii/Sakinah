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