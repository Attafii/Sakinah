// background.js - Service worker for notifications and alarms

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
        await this.loadSettings();
        this.setupEventListeners();
        this.setupAlarms();
    }

    // Load Quran data for notifications
    async loadQuranData() {
        try {
            const response = await fetch(chrome.runtime.getURL('quran.json'));
            this.ayahData = await response.json();
            console.log('Background: Quran data loaded');
        } catch (error) {
            console.error('Background: Error loading Quran data:', error);
        }
    }

    // Load notification settings
    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get({
                notificationsEnabled: false,
                notificationFrequency: 60,
                customTimes: [],
                quietStart: '22:00',
                quietEnd: '07:00',
                notificationType: 'interval'
            });

            this.notificationSettings = {
                enabled: settings.notificationsEnabled,
                frequency: settings.notificationFrequency,
                customTimes: settings.customTimes,
                quietStart: settings.quietStart,
                quietEnd: settings.quietEnd,
                type: settings.notificationType
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
        }
    }

    // Handle storage changes
    async handleStorageChange(changes, namespace) {
        if (namespace === 'sync') {
            let shouldUpdateAlarms = false;
            
            if (changes.notificationsEnabled || changes.notificationFrequency || 
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
    handleNotificationClick(notificationId) {
        if (notificationId.startsWith('sakinah-')) {
            // Open the extension popup
            chrome.action.openPopup();
        }
    }

    // Handle installation
    handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('Background: Extension installed');
            // Could show welcome notification or open options page
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

            let title = 'Sakinah - A verse for you';
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
                message: message,
                contextMessage: `${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})`,
                priority: 1,
                requireInteraction: false
            };

            chrome.notifications.create(notificationId, notificationOptions);
            
            console.log('Background: Notification shown for ayah:', ayah.id);

            // Store the ayah for potential retrieval by popup
            await chrome.storage.local.set({ 
                lastNotificationAyah: ayah,
                lastNotificationTime: Date.now()
            });

        } catch (error) {
            console.error('Background: Error showing notification:', error);
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