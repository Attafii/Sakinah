// content.js - Content script for elegant notifications

// Notification system class
class SakinahNotification {
    constructor() {
        this.container = null;
        this.activeNotifications = [];
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('sakinah-notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'sakinah-notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            `;
            document.body.appendChild(this.container);
        }
    }

    async show(ayah, options = {}) {
        const notification = this.createNotificationElement(ayah, options);
        this.container.appendChild(notification);
        this.activeNotifications.push(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        const duration = options.duration || 8000;
        setTimeout(() => {
            this.hide(notification);
        }, duration);

        return notification;
    }

    createNotificationElement(ayah, options) {
        const notification = document.createElement('div');
        notification.className = 'sakinah-notification';
        
        const showArabic = options.showArabic !== false;
        const showTranslation = options.showTranslation !== false;
        
        notification.innerHTML = `
            <div class="sakinah-notification-card">
                <div class="sakinah-notification-header">
                    <div class="sakinah-notification-icon">🌙</div>
                    <div class="sakinah-notification-title">Sakinah</div>
                    <button class="sakinah-notification-close">×</button>
                </div>
                <div class="sakinah-notification-content">
                    ${showArabic ? `<div class="sakinah-notification-arabic">${ayah.arabic}</div>` : ''}
                    ${showTranslation ? `<div class="sakinah-notification-translation">${ayah.translation}</div>` : ''}
                    <div class="sakinah-notification-reference">${ayah.surah} (${ayah.surahNumber}:${ayah.ayahNumber})</div>
                </div>
                <div class="sakinah-notification-actions">
                    <button class="sakinah-notification-btn primary" data-action="open">Open Extension</button>
                    <button class="sakinah-notification-btn secondary" data-action="save">Save Ayah</button>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: relative;
            margin-bottom: 15px;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
            max-width: 400px;
            min-width: 350px;
        `;

        this.addStyles();
        this.addEventListeners(notification, ayah);
        return notification;
    }

    addStyles() {
        if (document.getElementById('sakinah-notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'sakinah-notification-styles';
        style.textContent = `
            .sakinah-notification-card {
                background: linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%);
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .sakinah-notification-header {
                display: flex;
                align-items: center;
                padding: 16px 20px 12px;
                background: rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .sakinah-notification-icon {
                font-size: 20px;
                margin-right: 10px;
                animation: sakinah-glow 2s ease-in-out infinite alternate;
            }

            @keyframes sakinah-glow {
                from { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
                to { text-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
            }

            .sakinah-notification-title {
                color: white;
                font-weight: 600;
                font-size: 16px;
                flex: 1;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .sakinah-notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.8);
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .sakinah-notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            .sakinah-notification-content {
                padding: 20px;
                color: white;
            }

            .sakinah-notification-arabic {
                font-size: 18px;
                line-height: 1.6;
                text-align: right;
                direction: rtl;
                margin-bottom: 12px;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .sakinah-notification-translation {
                font-size: 15px;
                line-height: 1.5;
                margin-bottom: 12px;
                opacity: 0.95;
                font-style: italic;
            }

            .sakinah-notification-reference {
                font-size: 12px;
                opacity: 0.8;
                text-align: right;
                font-weight: 500;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 8px;
                margin-top: 12px;
            }

            .sakinah-notification-actions {
                padding: 0 20px 20px;
                display: flex;
                gap: 10px;
            }

            .sakinah-notification-btn {
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                flex: 1;
            }

            .sakinah-notification-btn.primary {
                background: rgba(255, 255, 255, 0.9);
                color: #333;
            }

            .sakinah-notification-btn.primary:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sakinah-notification-btn.secondary {
                background: transparent;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .sakinah-notification-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
            }

            @media (max-width: 480px) {
                .sakinah-notification-card {
                    margin: 0 10px;
                    max-width: calc(100vw - 40px);
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addEventListeners(notification, ayah) {
        const closeBtn = notification.querySelector('.sakinah-notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        const openBtn = notification.querySelector('[data-action="open"]');
        const saveBtn = notification.querySelector('[data-action="save"]');

        openBtn.addEventListener('click', () => {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }
            this.hide(notification);
        });

        saveBtn.addEventListener('click', async () => {
            try {
                const saved = await chrome.storage.sync.get({ favorites: [] });
                const favorites = saved.favorites || [];
                
                if (!favorites.find(fav => fav.id === ayah.id)) {
                    favorites.push({
                        ...ayah,
                        savedAt: Date.now()
                    });
                    await chrome.storage.sync.set({ favorites });
                    
                    saveBtn.textContent = '✓ Saved';
                    saveBtn.style.background = 'rgba(76, 175, 80, 0.8)';
                    setTimeout(() => {
                        this.hide(notification);
                    }, 1000);
                } else {
                    saveBtn.textContent = 'Already Saved';
                    setTimeout(() => {
                        this.hide(notification);
                    }, 1000);
                }
            } catch (error) {
                console.error('Error saving ayah:', error);
                saveBtn.textContent = 'Error';
                setTimeout(() => {
                    this.hide(notification);
                }, 1000);
            }
        });
    }

    hide(notification) {
        if (!notification || !notification.parentNode) return;

        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 400);
    }
}

// Initialize notification system
let notificationSystem = null;

function initNotificationSystem() {
    if (!notificationSystem) {
        notificationSystem = new SakinahNotification();
    }
    return notificationSystem;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script: Received message:', request);
    
    if (request.action === 'showElegantNotification') {
        console.log('Content script: Showing elegant notification for ayah:', request.ayah?.id);
        showElegantNotification(request.ayah, request.options);
        sendResponse({ success: true });
    }
});

// Show elegant notification
async function showElegantNotification(ayah, options = {}) {
    try {
        console.log('Content script: showElegantNotification called with:', ayah);
        
        const settings = await chrome.storage.sync.get({
            showArabic: true,
            showTranslation: true,
            notificationDuration: 8000
        });

        const notifier = initNotificationSystem();
        
        const notificationOptions = {
            showArabic: settings.showArabic,
            showTranslation: settings.showTranslation,
            duration: settings.notificationDuration,
            ...options
        };

        await notifier.show(ayah, notificationOptions);
        
        console.log('Content script: Elegant notification shown for ayah:', ayah.id);
    } catch (error) {
        console.error('Content script: Error showing elegant notification:', error);
    }
}

console.log('Sakinah content script loaded and ready');