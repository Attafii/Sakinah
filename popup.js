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
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Random Ayah refresh
        document.getElementById('refresh-ayah').addEventListener('click', () => {
            this.showRandomAyah();
        });

        // AI Guide functionality
        document.getElementById('get-guidance').addEventListener('click', () => {
            this.getAIGuidance();
        });

        // Character count for textarea
        const textarea = document.getElementById('emotional-state');
        const charCount = document.getElementById('char-count');
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });

        // Settings
        document.getElementById('notifications-enabled').addEventListener('change', (e) => {
            this.toggleNotifications(e.target.checked);
        });

        document.getElementById('notification-frequency').addEventListener('change', (e) => {
            this.updateNotificationFrequency(e.target.value);
        });

        document.getElementById('show-arabic').addEventListener('change', (e) => {
            this.updateDisplaySetting('showArabic', e.target.checked);
        });

        document.getElementById('show-translation').addEventListener('change', (e) => {
            this.updateDisplaySetting('showTranslation', e.target.checked);
        });

        document.getElementById('open-options').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    // Switch between tabs
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

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
        
        document.getElementById(`${prefix}ayah-arabic`).textContent = ayah.arabic;
        document.getElementById(`${prefix}ayah-translation`).textContent = ayah.translation;
        document.getElementById(`${prefix}ayah-reference`).textContent = `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`;

        if (context === 'random') {
            document.getElementById('ayah-content').style.display = 'block';
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