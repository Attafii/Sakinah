// notification.js - Custom elegant notification system

class SakinahNotification {
    constructor() {
        this.container = null;
        this.activeNotifications = [];
        this.createContainer();
    }

    createContainer() {
        // Create notification container if it doesn't exist
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

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-hide after duration
        const duration = options.duration || 8000;
        setTimeout(() => {
            this.hide(notification);
        }, duration);

        return notification;
    }

    createNotificationElement(ayah, options) {
        const notification = document.createElement('div');
        notification.className = 'sakinah-notification';
        
        // Get settings for display preferences
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

        // Add styles
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

        // Add internal styles
        const style = document.createElement('style');
        style.textContent = `
            .sakinah-notification-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                animation: glow 2s ease-in-out infinite alternate;
            }

            @keyframes glow {
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

        if (!document.getElementById('sakinah-notification-styles')) {
            style.id = 'sakinah-notification-styles';
            document.head.appendChild(style);
        }

        // Add event listeners
        this.addEventListeners(notification, ayah);

        return notification;
    }

    addEventListeners(notification, ayah) {
        // Close button
        const closeBtn = notification.querySelector('.sakinah-notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        // Action buttons
        const openBtn = notification.querySelector('[data-action="open"]');
        const saveBtn = notification.querySelector('[data-action="save"]');

        openBtn.addEventListener('click', () => {
            // Try to open extension popup or redirect to extension page
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }
            this.hide(notification);
        });

        saveBtn.addEventListener('click', async () => {
            try {
                // Save ayah to favorites
                const saved = await chrome.storage.sync.get({ favorites: [] });
                const favorites = saved.favorites || [];
                
                // Check if already saved
                if (!favorites.find(fav => fav.id === ayah.id)) {
                    favorites.push({
                        ...ayah,
                        savedAt: Date.now()
                    });
                    await chrome.storage.sync.set({ favorites });
                    
                    // Show feedback
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

        // Auto-hide on click outside (optional)
        notification.addEventListener('click', (e) => {
            if (e.target === notification) {
                this.hide(notification);
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

    hideAll() {
        this.activeNotifications.forEach(notification => {
            this.hide(notification);
        });
    }

    // Static method to show notification from content script
    static async showAyahNotification(ayah, options = {}) {
        // This will be called from content script
        if (!window.sakinahNotifier) {
            window.sakinahNotifier = new SakinahNotification();
        }
        return window.sakinahNotifier.show(ayah, options);
    }
}

// Initialize if in content script context
if (typeof window !== 'undefined') {
    window.SakinahNotification = SakinahNotification;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SakinahNotification;
}