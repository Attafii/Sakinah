class SakinahOptions {
    constructor() {
        this.settings = {};
        this.customTimes = [];
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupSidebar();
        this.checkAIService();
        this.updateTheme();
        this.applyDisplaySettings();
        
        // Listen for storage changes to update theme in real-time
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync') {
                if (changes.theme) {
                    this.settings.theme = changes.theme.newValue;
                    this.updateTheme();
                }
                if (changes.arabicFont || changes.fontSize) {
                    if (changes.arabicFont) this.settings.arabicFont = changes.arabicFont.newValue;
                    if (changes.fontSize) this.settings.fontSize = changes.fontSize.newValue;
                    this.applyDisplaySettings();
                }
            }
        });
    }

    applyDisplaySettings() {
        const body = document.body;
        
        // Apply Arabic Font
        const fontClass = this.settings.arabicFont || 'font-uthmani';
        body.classList.remove('font-uthmani', 'font-indopak', 'font-standard');
        body.classList.add(fontClass);

        // Apply Font Size
        const sizeClass = `size-${this.settings.fontSize || 'medium'}`;
        body.classList.remove('size-small', 'size-medium', 'size-large', 'size-extra-large');
        body.classList.add(sizeClass);
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(CONFIG.DEFAULT_SETTINGS, (settings) => {
                this.settings = settings;
                this.customTimes = settings.notificationCustomTimes || [];
                this.applySettingsToUI();
                resolve();
            });
        });
    }

    applySettingsToUI() {
        // General
        document.getElementById('enable-newtab').checked = this.settings.newTabEnabled;
        document.getElementById('interface-language').value = this.settings.language;
        document.getElementById('primary-ecosystem').value = this.settings.primaryEcosystem || 'google';

        // Daily Deeds
        if (this.settings.deeds && Array.isArray(this.settings.deeds)) {
            this.settings.deeds.forEach((deed, index) => {
                const input = document.getElementById(`deed-${index + 1}`);
                if (input) input.value = deed;
            });
        }

        // Appearance
        document.getElementById('theme-mode').value = this.settings.theme;
        document.getElementById('arabic-font').value = this.settings.arabicFont;
        document.getElementById('font-size').value = this.settings.fontSize;
        document.getElementById('reciter').value = this.settings.reciter || 'ar.alafasy';
        document.getElementById('show-adhkar').checked = this.settings.showAdhkar;
        document.getElementById('show-quiz').checked = this.settings.showQuiz;
        document.getElementById('ayah-rotation').value = this.settings.ayahRotation;

        // Prayer
        document.getElementById('prayer-city').value = this.settings.prayerCity;
        document.getElementById('prayer-country').value = this.settings.prayerCountry;
        document.getElementById('prayer-method').value = this.settings.prayerMethod;

        // Notifications
        document.getElementById('enable-notifications').checked = this.settings.notificationsEnabled;
        document.getElementById('notification-type').value = this.settings.notificationType;
        document.getElementById('notification-interval').value = this.settings.notificationInterval;
        document.getElementById('quiet-start').value = this.settings.quietHoursStart;
        document.getElementById('quiet-end').value = this.settings.quietHoursEnd;

        // AI
        document.getElementById('ai-detailed-explanations').checked = this.settings.aiDetailedExplanations;
        document.getElementById('ai-response-style').value = this.settings.aiResponseStyle;
        document.getElementById('explanation-language').value = this.settings.explanationLanguage;

        // Data
        document.getElementById('offline-mode').checked = this.settings.offlineMode;

        this.renderCustomTimes();
        this.toggleNotificationOptions();
    }

    setupSidebar() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.getAttribute('data-section');
                
                // Update nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update sections
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `section-${sectionId}`) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    setupEventListeners() {
        // Save button
        document.getElementById('save-settings').addEventListener('click', () => this.saveAllSettings());

        // New Tab Experience toggle - Prompt for permissions immediately
        document.getElementById('enable-newtab').addEventListener('change', async (e) => {
            const optionalPermissions = ['bookmarks', 'sessions', 'topSites', 'history'];
            if (e.target.checked) {
                const granted = await new Promise((resolve) => {
                    chrome.permissions.request({ permissions: optionalPermissions }, resolve);
                });
                
                if (!granted) {
                    this.showToast("Permission denied. Some new tab features will be disabled.");
                    // Optional: uncheck if permission is mandatory?
                    // Better to let them try with limited features.
                } else {
                    this.showToast("Permissions granted! Premium features enabled.");
                }
            } else {
                chrome.permissions.remove({ permissions: optionalPermissions }, (removed) => {
                    if (removed) this.showToast("Permissions revoked.");
                });
            }
        });

        // Notification toggles
        document.getElementById('enable-notifications').addEventListener('change', (e) => {
            this.toggleNotificationOptions();
        });

        document.getElementById('notification-type').addEventListener('change', () => {
            this.toggleNotificationOptions();
        });

        // Theme toggle - Apply immediately
        document.getElementById('theme-mode').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.updateTheme();
        });

        // Font change - Apply immediately
        document.getElementById('arabic-font').addEventListener('change', (e) => {
            this.settings.arabicFont = e.target.value;
            this.applyDisplaySettings();
        });

        // Font size change - Apply immediately
        document.getElementById('font-size').addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            this.applyDisplaySettings();
        });

        // Custom times
        document.getElementById('add-custom-time').addEventListener('click', () => this.addCustomTime());

        // Test notification
        document.getElementById('test-notification').addEventListener('click', () => this.sendTestNotification());

        // Data actions
        document.getElementById('export-settings').addEventListener('click', () => this.exportSettings());
        document.getElementById('import-settings').addEventListener('click', () => this.importSettings());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());
        document.getElementById('show-onboarding').addEventListener('click', () => {
            chrome.tabs.create({ url: 'onboarding.html' });
        });
    }

    toggleNotificationOptions() {
        const enabled = document.getElementById('enable-notifications').checked;
        const container = document.getElementById('notification-options-container');
        const type = document.getElementById('notification-type').value;
        
        container.style.display = enabled ? 'block' : 'none';
        
        if (enabled) {
            document.getElementById('interval-settings').style.display = 
                (type === 'interval' || type === 'both') ? 'block' : 'none';
            document.getElementById('custom-times-settings').style.display = 
                (type === 'custom' || type === 'both') ? 'block' : 'none';
        }
    }

    renderCustomTimes() {
        const container = document.getElementById('custom-times-container');
        container.innerHTML = '';

        this.customTimes.sort().forEach((time, index) => {
            const div = document.createElement('div');
            div.className = 'time-item';
            div.innerHTML = `
                <input type="time" value="${time}" data-index="${index}">
                <button class="remove-time-btn" data-index="${index}">✕</button>
            `;
            
            div.querySelector('input').addEventListener('change', (e) => {
                this.customTimes[index] = e.target.value;
            });

            div.querySelector('.remove-time-btn').addEventListener('click', () => {
                this.customTimes.splice(index, 1);
                this.renderCustomTimes();
            });

            container.appendChild(div);
        });
    }

    addCustomTime() {
        this.customTimes.push("12:00");
        this.renderCustomTimes();
    }

    async saveAllSettings() {
        const isNewTabEnabled = document.getElementById('enable-newtab').checked;
        const optionalPermissions = ['bookmarks', 'sessions', 'topSites', 'history'];

        if (isNewTabEnabled) {
            // Request optional permissions for the new tab experience
            const granted = await new Promise((resolve) => {
                chrome.permissions.request({ permissions: optionalPermissions }, (result) => {
                    resolve(result);
                });
            });

            if (!granted) {
                this.showToast("Note: Some new tab features may be limited without permissions.");
                // We still let them enable the tab, but warn them
            }
        } else {
            // Remove optional permissions if disabling the new tab experience
            chrome.permissions.remove({ permissions: optionalPermissions }, (removed) => {
                if (removed) {
                    console.log("Optional permissions removed.");
                }
            });
        }

        const newSettings = {
            newTabEnabled: isNewTabEnabled,
            language: document.getElementById('interface-language').value,
            primaryEcosystem: document.getElementById('primary-ecosystem').value,
            deeds: [
                document.getElementById('deed-1').value,
                document.getElementById('deed-2').value,
                document.getElementById('deed-3').value,
                document.getElementById('deed-4').value,
                document.getElementById('deed-5').value
            ],
            theme: document.getElementById('theme-mode').value,
            arabicFont: document.getElementById('arabic-font').value,
            fontSize: document.getElementById('font-size').value,
            reciter: document.getElementById('reciter').value,
            showAdhkar: document.getElementById('show-adhkar').checked,
            showQuiz: document.getElementById('show-quiz').checked,
            ayahRotation: document.getElementById('ayah-rotation').value,
            prayerCity: document.getElementById('prayer-city').value,
            prayerCountry: document.getElementById('prayer-country').value,
            prayerMethod: document.getElementById('prayer-method').value,
            notificationsEnabled: document.getElementById('enable-notifications').checked,
            notificationType: document.getElementById('notification-type').value,
            notificationInterval: parseInt(document.getElementById('notification-interval').value),
            notificationCustomTimes: this.customTimes,
            quietHoursStart: document.getElementById('quiet-start').value,
            quietHoursEnd: document.getElementById('quiet-end').value,
            aiDetailedExplanations: document.getElementById('ai-detailed-explanations').checked,
            aiResponseStyle: document.getElementById('ai-response-style').value,
            explanationLanguage: document.getElementById('explanation-language').value,
            offlineMode: document.getElementById('offline-mode').checked
        };

        chrome.storage.sync.set(newSettings, () => {
            this.showToast("Settings saved successfully!");
            // Notify background script to update alarms
            chrome.runtime.sendMessage({ action: 'updateAlarms' });
        });
    }

    updateTheme() {
        const mode = this.settings.theme || 'auto';
        const body = document.body;

        if (mode === 'dark') {
            body.classList.add('dark-mode');
        } else if (mode === 'light') {
            body.classList.remove('dark-mode');
        } else {
            // Auto mode
            this.checkAutoTheme();
        }
    }

    checkAutoTheme() {
        const body = document.body;
        const now = new Date();
        const hour = now.getHours();

        // Simple fallback: dark between 7 PM and 6 AM
        if (hour >= 19 || hour < 6) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        toastMsg.textContent = message;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    sendTestNotification() {
        chrome.runtime.sendMessage({ action: 'sendTestNotification' });
        this.showToast("Test notification sent!");
    }

    async checkAIService() {
        const statusEl = document.getElementById('ai-status');
        if (!statusEl) return;

        try {
            // Ensure URL doesn't have double slashes
            const baseUrl = CONFIG.WORKER_URL.replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/health`, {
                method: 'GET',
                cache: 'no-cache'
            });

            if (response.ok) {
                statusEl.textContent = "✓ AI Service is online and ready.";
                statusEl.style.color = "var(--primary-dark)";
            } else {
                console.warn(`AI Health Check returned status: ${response.status}`);
                throw new Error(`Status: ${response.status}`);
            }
        } catch (e) {
            console.error("AI Health Check failed:", e);
            statusEl.textContent = "⚠ AI Service is currently offline. Using local fallback.";
            statusEl.style.color = "#e67e22";
        }
    }

    exportSettings() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sakinah-settings.json';
        a.click();
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    chrome.storage.sync.set(settings, () => {
                        this.loadSettings();
                        this.showToast("Settings imported successfully!");
                    });
                } catch (err) {
                    this.showToast("Error: Invalid settings file.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetSettings() {
        if (confirm("Are you sure you want to reset all settings to default?")) {
            chrome.storage.sync.clear(() => {
                chrome.storage.sync.set(CONFIG.DEFAULT_SETTINGS, () => {
                    this.loadSettings();
                    this.showToast("Settings reset to default.");
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SakinahOptions();
});
