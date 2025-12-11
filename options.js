// options.js - Advanced settings page functionality

class SakinahOptions {
    constructor() {
        this.customTimes = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSettings();
    }

    setupEventListeners() {
        // Enable/disable notifications
        document.getElementById('enable-notifications').addEventListener('change', (e) => {
            this.toggleNotificationOptions(e.target.checked);
        });

        // Notification type change
        document.getElementById('notification-type').addEventListener('change', (e) => {
            this.updateNotificationTypeVisibility(e.target.value);
        });

        // Add custom time
        document.getElementById('add-custom-time').addEventListener('click', () => {
            this.addCustomTime();
        });

        // Save settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveAllSettings();
        });

        // Export settings
        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        // Import settings
        document.getElementById('import-settings').addEventListener('click', () => {
            this.importSettings();
        });

        // Reset settings
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Groq API toggle
        document.getElementById('use-groq-api').addEventListener('change', () => {
            this.checkAIStatus();
        });

    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get({
                // Notification settings
                notificationsEnabled: false,
                notificationType: 'interval',
                notificationInterval: 60,
                customTimes: [],
                quietStart: '22:00',
                quietEnd: '07:00',
                
                // Display settings
                showArabic: true,
                showTranslation: true,
                showSurahInfo: true,
                fontSize: 'medium',
                
                // AI Guide settings
                aiDetailedExplanations: true,
                aiContextHistory: false,
                aiResponseStyle: 'detailed',
                explanationLanguage: 'english',
                useGroqAPI: true,
                groqApiKey: CONFIG.GROQ_API_KEY,
                
                // Privacy settings
                offlineMode: true,
                anonymousUsage: false
            });

            // Load notification settings
            document.getElementById('enable-notifications').checked = settings.notificationsEnabled;
            document.getElementById('notification-type').value = settings.notificationType;
            document.getElementById('notification-interval').value = settings.notificationInterval;
            document.getElementById('quiet-start').value = settings.quietStart;
            document.getElementById('quiet-end').value = settings.quietEnd;

            // Load display settings
            document.getElementById('show-arabic-text').checked = settings.showArabic;
            document.getElementById('show-english-translation').checked = settings.showTranslation;
            document.getElementById('show-surah-info').checked = settings.showSurahInfo;
            document.getElementById('font-size').value = settings.fontSize;

            // Load AI settings
            document.getElementById('ai-detailed-explanations').checked = settings.aiDetailedExplanations;
            document.getElementById('ai-context-history').checked = settings.aiContextHistory;
            document.getElementById('ai-response-style').value = settings.aiResponseStyle;
            document.getElementById('use-groq-api').checked = settings.useGroqAPI;
            document.getElementById('explanation-language').value = settings.explanationLanguage || 'english';

            // Load privacy settings
            document.getElementById('offline-mode').checked = settings.offlineMode;
            document.getElementById('anonymous-usage').checked = settings.anonymousUsage;

            // Load custom times
            this.customTimes = settings.customTimes || [];
            this.renderCustomTimes();

            // Update visibility
            this.toggleNotificationOptions(settings.notificationsEnabled);
            this.updateNotificationTypeVisibility(settings.notificationType);

            // Check AI status
            this.checkAIStatus();

        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    toggleNotificationOptions(enabled) {
        const options = document.getElementById('notification-options');
        options.style.display = enabled ? 'block' : 'none';
    }

    updateNotificationTypeVisibility(type) {
        const intervalSettings = document.getElementById('interval-settings');
        const customSettings = document.getElementById('custom-times-settings');

        intervalSettings.style.display = (type === 'interval' || type === 'both') ? 'block' : 'none';
        customSettings.style.display = (type === 'custom' || type === 'both') ? 'block' : 'none';
    }

    addCustomTime(time = '09:00') {
        this.customTimes.push(time);
        this.renderCustomTimes();
    }

    removeCustomTime(index) {
        this.customTimes.splice(index, 1);
        this.renderCustomTimes();
    }

    renderCustomTimes() {
        const container = document.getElementById('custom-times-container');
        container.innerHTML = '';

        this.customTimes.forEach((time, index) => {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'time-input';
            timeDiv.innerHTML = `
                <input type="time" value="${time}" data-index="${index}">
                <button class="remove-time-btn" data-index="${index}">Remove</button>
            `;
            container.appendChild(timeDiv);
        });

        // Add event listeners for time inputs and remove buttons
        container.querySelectorAll('input[type="time"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.customTimes[index] = e.target.value;
            });
        });

        container.querySelectorAll('.remove-time-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeCustomTime(index);
            });
        });
    }

    async saveAllSettings() {
        try {
            const settings = {
                // Notification settings
                notificationsEnabled: document.getElementById('enable-notifications').checked,
                notificationType: document.getElementById('notification-type').value,
                notificationInterval: parseInt(document.getElementById('notification-interval').value),
                customTimes: this.customTimes,
                quietStart: document.getElementById('quiet-start').value,
                quietEnd: document.getElementById('quiet-end').value,
                
                // Display settings
                showArabic: document.getElementById('show-arabic-text').checked,
                showTranslation: document.getElementById('show-english-translation').checked,
                showSurahInfo: document.getElementById('show-surah-info').checked,
                fontSize: document.getElementById('font-size').value,
                
                // AI Guide settings
                aiDetailedExplanations: document.getElementById('ai-detailed-explanations').checked,
                aiContextHistory: document.getElementById('ai-context-history').checked,
                aiResponseStyle: document.getElementById('ai-response-style').value,
                explanationLanguage: document.getElementById('explanation-language').value,
                useGroqAPI: document.getElementById('use-groq-api').checked,
                
                // Privacy settings
                offlineMode: document.getElementById('offline-mode').checked,
                anonymousUsage: document.getElementById('anonymous-usage').checked
            };

            await chrome.storage.sync.set(settings);
            
            // Notify background script of changes
            chrome.runtime.sendMessage({
                action: 'settingsUpdated',
                settings: settings
            });

            this.showSuccessMessage();

        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
    }

    showSuccessMessage() {
        const message = document.getElementById('success-message');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }

    async exportSettings() {
        try {
            const settings = await chrome.storage.sync.get();
            const dataStr = JSON.stringify(settings, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sakinah-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting settings:', error);
            alert('Error exporting settings.');
        }
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const settings = JSON.parse(text);
                
                await chrome.storage.sync.set(settings);
                location.reload(); // Reload page to show imported settings

            } catch (error) {
                console.error('Error importing settings:', error);
                alert('Error importing settings. Please check the file format.');
            }
        };

        input.click();
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            try {
                await chrome.storage.sync.clear();
                location.reload(); // Reload page to show default settings

            } catch (error) {
                console.error('Error resetting settings:', error);
                alert('Error resetting settings.');
            }
        }
    }

    async checkAIStatus() {
        const statusElement = document.getElementById('ai-status');
        const useGroqAPI = document.getElementById('use-groq-api').checked;
        
        if (!useGroqAPI) {
            statusElement.innerHTML = '<small>📱 Offline mode - Using local AI analysis</small>';
            statusElement.className = 'ai-status offline';
            return;
        }

        statusElement.innerHTML = '<small>🔄 Checking AI service status...</small>';
        statusElement.className = 'ai-status checking';

        try {
            // Check whether a Groq API key is stored, and perform a minimal authenticated request if available
            const stored = await chrome.storage.sync.get({ groqApiKey: '' });
            const apiKey = stored.groqApiKey;

            if (!apiKey) {
                throw new Error('No Groq API key configured');
            }

            // Minimal test request to validate the key (small token usage)
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-70b-versatile',
                    messages: [{ role: 'user', content: 'ping' }],
                    max_tokens: 1
                })
            });

            if (response.ok) {
                statusElement.innerHTML = '<small>✅ AI service connected and ready</small>';
                statusElement.className = 'ai-status online';
            } else {
                throw new Error('API connection failed');
            }
        } catch (error) {
            console.log('Groq API check failed:', error);
            statusElement.innerHTML = '';
            statusElement.className = 'ai-status';
        }
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SakinahOptions();
});