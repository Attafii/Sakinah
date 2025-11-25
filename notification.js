// content.js - Modern & Elegant Notification System for Sakinah

class SakinahNotification {
    constructor() {
        this.container = null;
        this.activeNotifications = [];
        this.createContainer();
        this.injectStyles();
    }

    createContainer() {
        if (!document.getElementById('sakinah-notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'sakinah-notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('sakinah-notification-container');
        }
    }

    injectStyles() {
        if (document.getElementById('sakinah-notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'sakinah-notification-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

            #sakinah-notification-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 2147483647;
                pointer-events: none;
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
            }

            .sakinah-notification {
                position: relative;
                margin-bottom: 16px;
                transform: translateX(450px) scale(0.95);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                pointer-events: auto;
                max-width: 420px;
                min-width: 360px;
            }

            .sakinah-notification.show {
                transform: translateX(0) scale(1);
                opacity: 1;
            }

            .sakinah-notification.hide {
                transform: translateX(450px) scale(0.95);
                opacity: 0;
            }

            .sakinah-notification-card {
                background: linear-gradient(145deg, #ffffff 0%, #f8fdfb 100%);
                border-radius: 20px;
                box-shadow: 
                    0 25px 50px -12px rgba(43, 140, 123, 0.25),
                    0 12px 24px -8px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.9);
                overflow: hidden;
                border: 1px solid rgba(114, 186, 174, 0.15);
                position: relative;
            }

            .sakinah-notification-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #A8EBD8 0%, #72BAAE 50%, #2B8C7B 100%);
                animation: sakinah-shimmer 3s ease-in-out infinite;
            }

            @keyframes sakinah-shimmer {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .sakinah-notification-header {
                display: flex;
                align-items: center;
                padding: 16px 20px 14px;
                background: linear-gradient(135deg, rgba(168, 235, 216, 0.15) 0%, rgba(114, 186, 174, 0.1) 100%);
                border-bottom: 1px solid rgba(114, 186, 174, 0.1);
            }

            .sakinah-notification-logo {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #72BAAE 0%, #2B8C7B 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                box-shadow: 0 4px 12px rgba(43, 140, 123, 0.3);
                animation: sakinah-pulse 2s ease-in-out infinite;
            }

            @keyframes sakinah-pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(43, 140, 123, 0.3); }
                50% { transform: scale(1.05); box-shadow: 0 6px 16px rgba(43, 140, 123, 0.4); }
            }

            .sakinah-notification-logo span {
                font-size: 18px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
            }

            .sakinah-notification-title-group {
                flex: 1;
            }

            .sakinah-notification-title {
                color: #2B8C7B;
                font-weight: 700;
                font-size: 15px;
                letter-spacing: 0.3px;
            }

            .sakinah-notification-subtitle {
                color: #72BAAE;
                font-size: 11px;
                margin-top: 2px;
                font-weight: 500;
            }

            .sakinah-notification-close {
                background: rgba(114, 186, 174, 0.1);
                border: none;
                color: #72BAAE;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                padding: 0;
                width: 28px;
                height: 28px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .sakinah-notification-close:hover {
                background: rgba(220, 53, 69, 0.1);
                color: #dc3545;
                transform: scale(1.1);
            }

            .sakinah-notification-content {
                padding: 20px 24px;
                position: relative;
            }

            .sakinah-notification-content::before {
                content: '"';
                position: absolute;
                top: 8px;
                left: 12px;
                font-size: 60px;
                font-family: Georgia, serif;
                color: rgba(114, 186, 174, 0.1);
                line-height: 1;
            }

            .sakinah-notification-arabic {
                font-family: 'Amiri', 'Traditional Arabic', serif;
                font-size: 22px;
                line-height: 1.8;
                text-align: right;
                direction: rtl;
                margin-bottom: 16px;
                color: #1a3a36;
                position: relative;
                z-index: 1;
            }

            .sakinah-notification-translation {
                font-size: 14px;
                line-height: 1.7;
                margin-bottom: 16px;
                color: #495057;
                font-style: italic;
                padding-left: 16px;
                border-left: 3px solid rgba(114, 186, 174, 0.3);
            }

            .sakinah-notification-reference {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: white;
                background: linear-gradient(135deg, #72BAAE 0%, #2B8C7B 100%);
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(43, 140, 123, 0.3);
            }

            .sakinah-notification-reference::before {
                content: '📖';
                font-size: 12px;
            }

            .sakinah-notification-actions {
                padding: 0 20px 20px;
                display: flex;
                gap: 10px;
            }

            .sakinah-notification-btn {
                border: none;
                border-radius: 12px;
                padding: 12px 20px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .sakinah-notification-btn.primary {
                background: linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%);
                color: #1a3a36;
                box-shadow: 0 4px 14px rgba(114, 186, 174, 0.4);
            }

            .sakinah-notification-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(114, 186, 174, 0.5);
            }

            .sakinah-notification-btn.primary:active {
                transform: translateY(0);
            }

            .sakinah-notification-btn.secondary {
                background: transparent;
                color: #72BAAE;
                border: 2px solid rgba(114, 186, 174, 0.3);
            }

            .sakinah-notification-btn.secondary:hover {
                background: rgba(114, 186, 174, 0.1);
                border-color: #72BAAE;
                transform: translateY(-2px);
            }

            .sakinah-notification-btn.saved {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                color: #155724;
                border-color: transparent;
            }

            .sakinah-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #72BAAE 0%, #2B8C7B 100%);
                border-radius: 0 0 20px 20px;
                animation: sakinah-progress 8s linear forwards;
            }

            @keyframes sakinah-progress {
                from { width: 100%; }
                to { width: 0%; }
            }

            .sakinah-notification-timer {
                position: absolute;
                bottom: 8px;
                right: 20px;
                font-size: 11px;
                color: #adb5bd;
                font-weight: 500;
            }

            /* Mobile responsive */
            @media (max-width: 480px) {
                #sakinah-notification-container {
                    top: 12px;
                    right: 12px;
                    left: 12px;
                }

                .sakinah-notification {
                    max-width: none;
                    min-width: auto;
                }

                .sakinah-notification-arabic {
                    font-size: 18px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async show(ayah, options = {}) {
        const notification = this.createNotificationElement(ayah, options);
        this.container.appendChild(notification);
        this.activeNotifications.push(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notification.classList.add('show');
            });
        });

        // Auto-hide after duration
        const duration = options.duration || 8000;
        
        // Update timer countdown
        let remaining = Math.floor(duration / 1000);
        const timerEl = notification.querySelector('.sakinah-notification-timer');
        const timerInterval = setInterval(() => {
            remaining--;
            if (timerEl && remaining > 0) {
                timerEl.textContent = `${remaining}s`;
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(timerInterval);
            this.hide(notification);
        }, duration);

        return notification;
    }

    createNotificationElement(ayah, options) {
        const notification = document.createElement('div');
        notification.className = 'sakinah-notification';
        
        const showArabic = options.showArabic !== false;
        const showTranslation = options.showTranslation !== false;
        const duration = options.duration || 8000;
        
        notification.innerHTML = `
            <div class="sakinah-notification-card">
                <div class="sakinah-notification-header">
                    <div class="sakinah-notification-logo">
                        <span>🌙</span>
                    </div>
                    <div class="sakinah-notification-title-group">
                        <div class="sakinah-notification-title">سكينة Sakinah</div>
                        <div class="sakinah-notification-subtitle">A verse of peace for you</div>
                    </div>
                    <button class="sakinah-notification-close" aria-label="Close">×</button>
                </div>
                <div class="sakinah-notification-content">
                    ${showArabic ? `<div class="sakinah-notification-arabic">${ayah.arabic || ''}</div>` : ''}
                    ${showTranslation ? `<div class="sakinah-notification-translation">${ayah.translation || ''}</div>` : ''}
                    <div class="sakinah-notification-reference">${ayah.surah || 'Quran'} (${ayah.surahNumber || ''}:${ayah.ayahNumber || ''})</div>
                </div>
                <div class="sakinah-notification-actions">
                    <button class="sakinah-notification-btn primary" data-action="open">
                        <span>📖</span> Read More
                    </button>
                    <button class="sakinah-notification-btn secondary" data-action="save">
                        <span>🤍</span> Save
                    </button>
                </div>
                <div class="sakinah-notification-progress" style="animation-duration: ${duration}ms;"></div>
                <div class="sakinah-notification-timer">${Math.floor(duration/1000)}s</div>
            </div>
        `;

        this.addEventListeners(notification, ayah);
        return notification;
    }

    addEventListeners(notification, ayah) {
        const closeBtn = notification.querySelector('.sakinah-notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        const openBtn = notification.querySelector('[data-action="open"]');
        const saveBtn = notification.querySelector('[data-action="save"]');

        openBtn.addEventListener('click', () => {
            // Store ayah for viewing when user opens extension
            chrome.storage.local.set({ 
                lastNotificationAyah: ayah,
                openFromNotification: true 
            });
            this.hide(notification);
        });

        saveBtn.addEventListener('click', async () => {
            try {
                const saved = await chrome.storage.local.get({ favorites: [] });
                const favorites = saved.favorites || [];
                
                if (!favorites.find(fav => fav.id === ayah.id)) {
                    favorites.unshift({
                        ...ayah,
                        savedAt: Date.now()
                    });
                    await chrome.storage.local.set({ favorites });
                    
                    // Update button
                    saveBtn.innerHTML = '<span>❤️</span> Saved!';
                    saveBtn.classList.add('saved');
                    
                    setTimeout(() => {
                        this.hide(notification);
                    }, 1200);
                } else {
                    saveBtn.innerHTML = '<span>❤️</span> Already Saved';
                    saveBtn.classList.add('saved');
                }
            } catch (error) {
                console.error('Error saving ayah:', error);
                saveBtn.innerHTML = '<span>⚠️</span> Error';
            }
        });

        // Pause progress bar on hover
        notification.addEventListener('mouseenter', () => {
            const progress = notification.querySelector('.sakinah-notification-progress');
            if (progress) {
                progress.style.animationPlayState = 'paused';
            }
        });

        notification.addEventListener('mouseleave', () => {
            const progress = notification.querySelector('.sakinah-notification-progress');
            if (progress) {
                progress.style.animationPlayState = 'running';
            }
        });
    }

    hide(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.remove('show');
        notification.classList.add('hide');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 500);
    }

    hideAll() {
        [...this.activeNotifications].forEach(notification => {
            this.hide(notification);
        });
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
    
    if (request.action === 'testNotification') {
        // Test notification with sample data
        const sampleAyah = request.ayah || {
            id: 'test-1',
            arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            translation: 'Indeed, with hardship comes ease.',
            surah: 'Ash-Sharh',
            surahNumber: 94,
            ayahNumber: 6
        };
        showElegantNotification(sampleAyah, { duration: 10000 });
        sendResponse({ success: true });
    }
    
    return true;
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
            duration: options.duration || settings.notificationDuration,
            ...options
        };

        await notifier.show(ayah, notificationOptions);
        
        console.log('Content script: Elegant notification shown for ayah:', ayah.id);
    } catch (error) {
        console.error('Content script: Error showing elegant notification:', error);
    }
}

console.log('Sakinah content script loaded and ready');
