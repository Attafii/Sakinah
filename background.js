// background.js - Service worker for notifications and alarms

// Ensure sakinahAI and config are available in this service worker scope
try {
    importScripts && importScripts('config.js', 'ai.js');
} catch (e) {
    console.warn('Background: Could not import scripts via importScripts:', e);
}

class SakinahBackground {
    constructor() {
        this.ayahData = null;
        this.notificationSettings = {
            enabled: false,
            frequency: 60, // minutes
            customTimes: [],
            quietStart: '22:00',
            quietEnd: '07:00'
        };
        this.init();
    }

    async init() {
        await this.loadQuranData();
        await this.loadHifdhData();
        await this.loadSettings();
        this.setupEventListeners();
        this.setupAlarms();
    }

    // Load Quran data for notifications
    async loadQuranData() {
        try {
            const url = chrome.runtime.getURL('quran.json');
            const response = await fetch(url);
            const text = await response.text();

            try {
                this.ayahData = JSON.parse(text);
                console.log('Background: Quran data loaded (items:', (this.ayahData && this.ayahData.ayahs) ? this.ayahData.ayahs.length : 0, ')');
            } catch (parseError) {
                console.error('Background: JSON parse error while loading quran.json:', parseError);
                // Log a helpful snippet of the file to aid debugging (first 2k chars)
                try {
                    const snippet = text.slice(0, 2000);
                    console.error('Background: quran.json snippet (first 2000 chars):\n', snippet);
                } catch (snipErr) {
                    console.error('Background: Failed to capture quran.json snippet:', snipErr);
                }

                // Re-throw so outer catch can also log and the failure is visible
                throw parseError;
            }
        } catch (error) {
            console.error('Background: Error loading Quran data:', error);
        }
    }

    // Load full Quran data from hifdh file
    async loadHifdhData() {
        try {
            const url = chrome.runtime.getURL('quran_hifdh.json');
            const response = await fetch(url);
            const raw = await response.json();
            
            // Normalize for AI use
            let surahs = [];
            const keys = Object.keys(raw).filter(k => /^\d+$/.test(k)).sort((a,b)=>parseInt(a)-parseInt(b));
            keys.forEach(k => {
                const arr = raw[k] || [];
                const sNum = parseInt(k, 10);
                const ayahs = Array.isArray(arr) ? arr.map(a => ({
                    numberInSurah: a.verse || a.verseNumber || a.ayah || 0,
                    arabic: a.text || a.arabic || '',
                    translation: a.translation || ''
                })) : [];
                surahs.push({ number: sNum, ayahs });
            });

            if (typeof sakinahAI !== 'undefined' && sakinahAI) {
                sakinahAI.setFullQuranDatabase({ surahs });
                console.log('Background: Full Quran database provided to AI');
            }
        } catch (error) {
            console.error('Background: Error loading hifdh data:', error);
        }
    }

    // Load notification settings
    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get(CONFIG.DEFAULT_SETTINGS);

            // Use notificationInterval, but fallback to notificationFrequency if set
            const frequency = settings.notificationInterval || settings.notificationFrequency || 60;

            this.notificationSettings = {
                enabled: settings.notificationsEnabled,
                frequency: frequency,
                customTimes: settings.notificationCustomTimes || settings.customTimes || [],
                quietStart: settings.quietStart,
                quietEnd: settings.quietEnd,
                type: settings.notificationType,
                dailyEnabled: settings.dailyAyahEnabled,
                dailyTime: settings.dailyAyahTime
            };

            console.log('Background: Settings loaded', this.notificationSettings);
        } catch (error) {
            console.error('Background: Error loading settings:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for messages from popup/options
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep channel open for async response
        });

        // Listen for alarm events
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });

        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.handleStorageChange(changes, namespace);
        });

        // Listen for notification clicks
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });

        // Listen for installation/startup
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });
    }

    // Handle messages from popup and options pages
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'toggleNotifications':
                    await this.toggleNotifications(request.enabled);
                    sendResponse({ success: true });
                    break;

                case 'updateNotificationFrequency':
                    await this.updateNotificationFrequency(request.frequency);
                    sendResponse({ success: true });
                    break;

                case 'settingsUpdated':
                    await this.handleSettingsUpdate(request.settings);
                    sendResponse({ success: true });
                    break;

                case 'showRandomAyah':
                    await this.showRandomAyahNotification();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background: Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    // Handle alarm events
    handleAlarm(alarm) {
        console.log('Background: Alarm triggered:', alarm.name);
        
        if (alarm.name === 'sakinah-notification' || alarm.name.startsWith('sakinah-custom-')) {
            if (this.isQuietTime()) {
                console.log('Background: Skipping notification during quiet time');
                return;
            }
            this.showRandomAyahNotification();
        } else if (alarm.name === 'sakinah-daily-ayah') {
            if (this.isQuietTime()) {
                console.log('Background: Skipping daily ayah during quiet time');
                return;
            }
            this.showDailyAyahNotification();
        }
    }

    // Handle storage changes
    async handleStorageChange(changes, namespace) {
        if (namespace === 'sync') {
            let shouldUpdateAlarms = false;
            
            if (changes.notificationsEnabled || changes.notificationInterval || changes.notificationFrequency ||
                changes.customTimes || changes.notificationType) {
                shouldUpdateAlarms = true;
            }

            if (shouldUpdateAlarms) {
                await this.loadSettings();
                this.setupAlarms();
            }
        }
    }

    // Handle notification clicks
    async handleNotificationClick(notificationId) {
        if (notificationId.startsWith('sakinah-')) {
            try {
                // Get the stored ayah data
                const data = await chrome.storage.local.get(['lastNotificationAyah', 'pendingNotificationAyah', 'showArabic', 'showTranslation']);
                
                // Use the most recent ayah
                const ayah = data.pendingNotificationAyah || data.lastNotificationAyah;
                
                if (ayah) {
                    // Store it as pending for the notification popup
                    await chrome.storage.local.set({ 
                        pendingNotificationAyah: ayah,
                        showArabic: data.showArabic !== false,
                        showTranslation: data.showTranslation !== false
                    });
                }

                // Open the notification popup window
                const popupWidth = 450;
                const popupHeight = 520;

                let windowOptions = {
                    url: chrome.runtime.getURL('notification.html'),
                    type: 'popup',
                    width: popupWidth,
                    height: popupHeight,
                    focused: true
                };

                // Try to position in top-right
                try {
                    const displays = await chrome.system.display.getInfo();
                    if (displays && displays.length > 0) {
                        const primaryDisplay = displays[0];
                        const screenWidth = primaryDisplay.workArea.width;
                        windowOptions.left = screenWidth - popupWidth - 30;
                        windowOptions.top = 30;
                    }
                } catch (displayErr) {
                    console.log('Background: Could not get display info, using default position');
                }

                await chrome.windows.create(windowOptions);
                
                // Close the notification after opening the popup
                chrome.notifications.clear(notificationId);
                
            } catch (error) {
                console.error('Background: Error opening notification popup:', error);
            }
        }
    }

    // Handle installation
    async handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('Background: Extension installed');
            // Check for existing settings
            const { settings } = await chrome.storage.sync.get(['settings']);
            
            if (!settings || settings.onboardingCompleted !== true) {
                // Open onboarding page on first install
                chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
            }
        } else if (details.reason === 'update') {
            console.log('Background: Extension updated');
        }
    }

    // Toggle notifications on/off
    async toggleNotifications(enabled) {
        this.notificationSettings.enabled = enabled;
        
        if (enabled) {
            this.setupAlarms();
            console.log('Background: Notifications enabled');
        } else {
            chrome.alarms.clearAll();
            console.log('Background: Notifications disabled');
        }
    }

    // Update notification frequency
    async updateNotificationFrequency(frequency) {
        this.notificationSettings.frequency = frequency;
        
        if (this.notificationSettings.enabled) {
            this.setupAlarms();
            console.log('Background: Notification frequency updated to', frequency, 'minutes');
        }
    }

    // Handle complete settings update
    async handleSettingsUpdate(settings) {
        this.notificationSettings = {
            enabled: settings.notificationsEnabled,
            frequency: settings.notificationInterval || settings.notificationFrequency,
            customTimes: settings.customTimes || [],
            quietStart: settings.quietStart,
            quietEnd: settings.quietEnd,
            type: settings.notificationType || 'interval'
        };

        if (this.notificationSettings.enabled) {
            this.setupAlarms();
        } else {
            chrome.alarms.clearAll();
        }
    }

    // Setup notification alarms
    setupAlarms() {
        // Clear existing alarms
        chrome.alarms.clearAll();

        if (!this.notificationSettings.enabled) {
            return;
        }

        // Setup interval-based notifications
        if (this.notificationSettings.type === 'interval' || this.notificationSettings.type === 'both') {
            chrome.alarms.create('sakinah-notification', {
                delayInMinutes: this.notificationSettings.frequency,
                periodInMinutes: this.notificationSettings.frequency
            });
            console.log('Background: Interval alarm set for every', this.notificationSettings.frequency, 'minutes');
        }

        // Setup custom time notifications
        if (this.notificationSettings.type === 'custom' || this.notificationSettings.type === 'both') {
            this.setupCustomTimeAlarms();
        }

        // Setup daily Ayah alarm if enabled
        if (this.notificationSettings.dailyEnabled) {
            const when = this.getNextAlarmTime(this.notificationSettings.dailyTime);
            chrome.alarms.create('sakinah-daily-ayah', { when: when, periodInMinutes: 24 * 60 });
            console.log('Background: Daily ayah alarm set for', this.notificationSettings.dailyTime, '(next:', new Date(when), ')');
        }
    }

    // Setup custom time alarms
    setupCustomTimeAlarms() {
        const customTimes = this.notificationSettings.customTimes || [];
        
        customTimes.forEach((time, index) => {
            const alarmName = `sakinah-custom-${index}`;
            const when = this.getNextAlarmTime(time);
            
            chrome.alarms.create(alarmName, { when: when });
            console.log(`Background: Custom alarm set for ${time} (${new Date(when)})`);
        });
    }

    // Calculate next alarm time for custom schedule
    getNextAlarmTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const now = new Date();
        const alarmTime = new Date();
        
        alarmTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, set for tomorrow
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }
        
        return alarmTime.getTime();
    }

    // Check if current time is within quiet hours
    isQuietTime() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [quietStartHour, quietStartMin] = this.notificationSettings.quietStart.split(':').map(Number);
        const [quietEndHour, quietEndMin] = this.notificationSettings.quietEnd.split(':').map(Number);
        
        const quietStart = quietStartHour * 60 + quietStartMin;
        const quietEnd = quietEndHour * 60 + quietEndMin;
        
        // Handle overnight quiet period (e.g., 22:00 to 07:00)
        if (quietStart > quietEnd) {
            return currentTime >= quietStart || currentTime <= quietEnd;
        } else {
            return currentTime >= quietStart && currentTime <= quietEnd;
        }
    }

    // Show random Ayah notification
    async showRandomAyahNotification() {
        if (!this.ayahData || !this.ayahData.ayahs) {
            console.error('Background: No Ayah data available for notification');
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.ayahData.ayahs.length);
        const ayah = this.ayahData.ayahs[randomIndex];
        
        const notificationId = `sakinah-${Date.now()}`;
        
        try {
            const settings = await chrome.storage.sync.get({
                showArabic: true,
                showTranslation: true
            });

            // Store the ayah data for the popup to read
            await chrome.storage.local.set({ 
                pendingNotificationAyah: ayah,
                showArabic: settings.showArabic,
                showTranslation: settings.showTranslation
            });

            // Open the notification popup window
            try {
                const popupWidth = 450;
                const popupHeight = 520;

                // Create popup window - position will be handled by the browser
                // We'll position it after getting display info
                let windowOptions = {
                    url: chrome.runtime.getURL('notification.html'),
                    type: 'popup',
                    width: popupWidth,
                    height: popupHeight,
                    focused: true
                };

                // Try to get display info to position in top-right
                try {
                    const displays = await chrome.system.display.getInfo();
                    if (displays && displays.length > 0) {
                        const primaryDisplay = displays[0];
                        const screenWidth = primaryDisplay.workArea.width;
                        windowOptions.left = screenWidth - popupWidth - 30;
                        windowOptions.top = 30;
                    }
                } catch (displayErr) {
                    // If we can't get display info, just let browser position it
                    console.log('Background: Could not get display info, using default position');
                }

                await chrome.windows.create(windowOptions);
                
                console.log('Background: Notification popup window opened');
            } catch (popupError) {
                console.error('Background: Could not open popup window:', popupError);
            }

            // Also show native Windows notification
            let title = 'Sakinah - A verse for you 🌙';
            let message = '';

            if (settings.showArabic) {
                title = ayah.arabic;
            }

            if (settings.showTranslation) {
                message = ayah.translation;
            }

            // Truncate if too long for notification
            if (title.length > 80) {
                title = title.substring(0, 77) + '...';
            }
            if (message.length > 120) {
                message = message.substring(0, 117) + '...';
            }

            const notificationOptions = {
                type: 'basic',
                title: title,
                message: message || `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`,
                iconUrl: chrome.runtime.getURL('icons/Sakinah.png'),
                contextMessage: `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`,
                priority: 2,
                requireInteraction: false
            };

            chrome.notifications.create(notificationId, notificationOptions);
            
            console.log('Background: Windows notification shown for ayah:', ayah.id);

            // Store the ayah for potential retrieval by popup
            await chrome.storage.local.set({ 
                lastNotificationAyah: ayah,
                lastNotificationTime: Date.now()
            });

        } catch (error) {
            console.error('Background: Error showing notification:', error);
        }
    }

    // Show daily Ayah with an AI explanation (stored for popup retrieval)
    async showDailyAyahNotification() {
        if (!this.ayahData || !this.ayahData.ayahs) {
            console.error('Background: No Ayah data available for daily ayah');
            return;
        }

        // Choose a daily ayah deterministically by date to avoid repeats within short span
        const today = new Date();
        const index = today.getFullYear() + today.getMonth() + today.getDate();
        const ayahList = this.ayahData.ayahs;
        const ayah = ayahList[index % ayahList.length];

        let explanation = '';
        try {
            if (typeof sakinahAI !== 'undefined' && sakinahAI && typeof sakinahAI.explainAyah === 'function') {
                explanation = await sakinahAI.explainAyah(ayah);
            } else {
                // Fallback to a short autogenerated explanation
                explanation = `Verse: ${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})\n\n${ayah.translation}\n\nReflect on this verse and its themes: ${ayah.theme || 'general guidance'}.`;
            }
        } catch (err) {
            console.error('Background: Error generating daily ayah explanation:', err);
            explanation = `Translation: ${ayah.translation}`;
        }

        const notificationId = `sakinah-daily-${Date.now()}`;

        try {
            const settings = await chrome.storage.sync.get({ showArabic: true, showTranslation: true });

            let title = 'Sakinah - Daily Ayah';
            let message = '';

            if (settings.showArabic) title = ayah.arabic || title;
            if (settings.showTranslation) message = ayah.translation || '';

            // Truncate for notification
            if (title.length > 80) title = title.substring(0, 77) + '...';
            if (message.length > 120) message = message.substring(0, 117) + '...';

            const notificationOptions = {
                type: 'basic',
                title: title,
                message: message || `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`,
                iconUrl: chrome.runtime.getURL('icons/Sakinah.png'),
                contextMessage: `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`,
                priority: 1
            };

            chrome.notifications.create(notificationId, notificationOptions);

            // Store the full explanation so popup/options can display it when user opens the extension
            await chrome.storage.local.set({ lastDailyAyah: ayah, lastDailyAyahExplanation: explanation, lastDailyAyahTime: Date.now() });

            console.log('Background: Daily Ayah notification shown for ayah:', ayah.id);
        } catch (error) {
            console.error('Background: Error showing daily ayah notification:', error);
        }
    }

    // Get notification permission
    async requestNotificationPermission() {
        return new Promise((resolve) => {
            chrome.notifications.getPermissionLevel((level) => {
                if (level === 'granted') {
                    resolve(true);
                } else {
                    // Try to request permission (this might not work in service worker)
                    resolve(false);
                }
            });
        });
    }

    // Cleanup function
    cleanup() {
        chrome.alarms.clearAll();
        console.log('Background: Cleanup completed');
    }
}

// Initialize the background service worker
const sakinahBackground = new SakinahBackground();

// Handle service worker lifecycle
self.addEventListener('install', (event) => {
    console.log('Background: Service worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Background: Service worker activating');
    event.waitUntil(self.clients.claim());
});

// Periodic cleanup (Chrome may terminate service workers)
chrome.alarms.create('sakinah-keepalive', {
    delayInMinutes: 1,
    periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'sakinah-keepalive') {
        // Just a keepalive, no action needed
        console.log('Background: Keepalive ping');
    }
});