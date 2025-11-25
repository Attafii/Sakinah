// content.js - Modern & Elegant In-Browser Notification System for Sakinah

// Prevent duplicate declaration if script is injected multiple times
if (typeof window.SakinahNotificationDefined === 'undefined') {
window.SakinahNotificationDefined = true;

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
                transform: translateX(500px) scale(0.9);
                opacity: 0;
                transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                pointer-events: auto;
                max-width: 440px;
                min-width: 380px;
            }

            .sakinah-notification.show {
                transform: translateX(0) scale(1);
                opacity: 1;
            }

            .sakinah-notification.hide {
                transform: translateX(500px) scale(0.9);
                opacity: 0;
            }

            .sakinah-notification-card {
                background: linear-gradient(165deg, #ffffff 0%, #f0faf7 50%, #e8f8f3 100%);
                border-radius: 24px;
                box-shadow: 
                    0 30px 60px -15px rgba(43, 140, 123, 0.35),
                    0 15px 30px -10px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(114, 186, 174, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 1);
                overflow: hidden;
                position: relative;
                backdrop-filter: blur(20px);
            }

            .sakinah-notification-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, #A8EBD8 0%, #72BAAE 30%, #2B8C7B 70%, #1a6b5a 100%);
                animation: sakinah-shimmer 4s ease-in-out infinite;
            }

            .sakinah-notification-card::after {
                content: '';
                position: absolute;
                top: 5px;
                left: 0;
                right: 0;
                height: 60px;
                background: linear-gradient(180deg, rgba(168, 235, 216, 0.15) 0%, transparent 100%);
                pointer-events: none;
            }

            @keyframes sakinah-shimmer {
                0%, 100% { opacity: 1; background-position: 0% 50%; }
                50% { opacity: 0.8; background-position: 100% 50%; }
            }

            .sakinah-notification-header {
                display: flex;
                align-items: center;
                padding: 18px 22px 16px;
                background: linear-gradient(135deg, rgba(168, 235, 216, 0.2) 0%, rgba(114, 186, 174, 0.08) 100%);
                border-bottom: 1px solid rgba(114, 186, 174, 0.12);
                position: relative;
            }

            .sakinah-notification-logo {
                width: 44px;
                height: 44px;
                background: linear-gradient(145deg, #72BAAE 0%, #2B8C7B 100%);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 14px;
                box-shadow: 
                    0 6px 16px rgba(43, 140, 123, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                animation: sakinah-pulse 3s ease-in-out infinite;
                position: relative;
            }

            .sakinah-notification-logo::before {
                content: '';
                position: absolute;
                inset: -3px;
                border-radius: 17px;
                background: linear-gradient(135deg, rgba(168, 235, 216, 0.5) 0%, rgba(43, 140, 123, 0.3) 100%);
                z-index: -1;
                animation: sakinah-glow 3s ease-in-out infinite;
            }

            @keyframes sakinah-glow {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
            }

            @keyframes sakinah-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.03); }
            }

            .sakinah-notification-logo span {
                font-size: 22px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }

            .sakinah-notification-title-group {
                flex: 1;
            }

            .sakinah-notification-title {
                color: #2B8C7B;
                font-weight: 700;
                font-size: 16px;
                letter-spacing: 0.5px;
                text-shadow: 0 1px 2px rgba(255,255,255,0.8);
            }

            .sakinah-notification-subtitle {
                color: #72BAAE;
                font-size: 12px;
                margin-top: 3px;
                font-weight: 500;
                letter-spacing: 0.3px;
            }

            .sakinah-notification-close {
                background: rgba(114, 186, 174, 0.12);
                border: none;
                color: #72BAAE;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.25s ease;
            }

            .sakinah-notification-close:hover {
                background: rgba(220, 53, 69, 0.12);
                color: #dc3545;
                transform: scale(1.1) rotate(90deg);
            }

            .sakinah-notification-content {
                padding: 24px 26px;
                position: relative;
            }

            .sakinah-notification-content::before {
                content: '❝';
                position: absolute;
                top: 10px;
                left: 16px;
                font-size: 48px;
                color: rgba(114, 186, 174, 0.12);
                line-height: 1;
            }

            .sakinah-notification-content::after {
                content: '❞';
                position: absolute;
                bottom: 50px;
                right: 16px;
                font-size: 48px;
                color: rgba(114, 186, 174, 0.08);
                line-height: 1;
            }

            .sakinah-notification-arabic {
                font-family: 'Amiri', 'Traditional Arabic', 'Noto Naskh Arabic', serif;
                font-size: 24px;
                line-height: 2;
                text-align: right;
                direction: rtl;
                margin-bottom: 18px;
                color: #1a3a36;
                position: relative;
                z-index: 1;
                text-shadow: 0 1px 1px rgba(255,255,255,0.5);
            }

            .sakinah-notification-translation {
                font-size: 14px;
                line-height: 1.75;
                margin-bottom: 18px;
                color: #495057;
                font-style: italic;
                padding-left: 18px;
                border-left: 4px solid rgba(114, 186, 174, 0.35);
                background: linear-gradient(90deg, rgba(114, 186, 174, 0.05) 0%, transparent 100%);
                padding: 12px 12px 12px 18px;
                border-radius: 0 12px 12px 0;
            }

            .sakinah-notification-reference {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: white;
                background: linear-gradient(135deg, #72BAAE 0%, #2B8C7B 100%);
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: 600;
                box-shadow: 
                    0 4px 12px rgba(43, 140, 123, 0.35),
                    inset 0 1px 0 rgba(255,255,255,0.2);
                letter-spacing: 0.3px;
            }

            .sakinah-notification-reference::before {
                content: '📖';
                font-size: 14px;
            }

            .sakinah-notification-actions {
                padding: 0 22px 22px;
                display: flex;
                gap: 12px;
            }

            .sakinah-notification-btn {
                border: none;
                border-radius: 14px;
                padding: 14px 22px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                letter-spacing: 0.3px;
            }

            .sakinah-notification-btn.primary {
                background: linear-gradient(135deg, #A8EBD8 0%, #72BAAE 100%);
                color: #1a3a36;
                box-shadow: 
                    0 6px 18px rgba(114, 186, 174, 0.45),
                    inset 0 1px 0 rgba(255,255,255,0.4);
            }

            .sakinah-notification-btn.primary:hover {
                transform: translateY(-3px);
                box-shadow: 
                    0 10px 25px rgba(114, 186, 174, 0.55),
                    inset 0 1px 0 rgba(255,255,255,0.4);
            }

            .sakinah-notification-btn.primary:active {
                transform: translateY(-1px);
            }

            .sakinah-notification-btn.secondary {
                background: rgba(255,255,255,0.8);
                color: #2B8C7B;
                border: 2px solid rgba(114, 186, 174, 0.35);
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .sakinah-notification-btn.secondary:hover {
                background: rgba(114, 186, 174, 0.12);
                border-color: #72BAAE;
                transform: translateY(-3px);
                box-shadow: 0 6px 15px rgba(114, 186, 174, 0.25);
            }

            .sakinah-notification-btn.saved {
                background: linear-gradient(135deg, #d4edda 0%, #b8e0c2 100%);
                color: #155724;
                border-color: transparent;
            }

            .sakinah-notification-progress-container {
                position: relative;
                height: 4px;
                background: rgba(114, 186, 174, 0.15);
                overflow: hidden;
            }

            .sakinah-notification-progress {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: linear-gradient(90deg, #A8EBD8 0%, #72BAAE 50%, #2B8C7B 100%);
                animation: sakinah-progress 12s linear forwards;
                box-shadow: 0 0 10px rgba(114, 186, 174, 0.5);
            }

            @keyframes sakinah-progress {
                from { width: 100%; }
                to { width: 0%; }
            }

            .sakinah-notification-timer {
                position: absolute;
                bottom: 10px;
                right: 22px;
                font-size: 11px;
                color: #adb5bd;
                font-weight: 600;
                background: rgba(255,255,255,0.7);
                padding: 3px 8px;
                border-radius: 10px;
            }

            /* Entrance sound effect indicator */
            .sakinah-notification-sound {
                position: absolute;
                top: 18px;
                right: 60px;
                font-size: 12px;
                opacity: 0.6;
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
                    font-size: 20px;
                }

                .sakinah-notification-card {
                    border-radius: 18px;
                }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .sakinah-notification-card {
                    background: linear-gradient(165deg, #1a2f2a 0%, #0f1f1c 50%, #0a1613 100%);
                    box-shadow: 
                        0 30px 60px -15px rgba(0, 0, 0, 0.6),
                        0 15px 30px -10px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(114, 186, 174, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .sakinah-notification-header {
                    background: linear-gradient(135deg, rgba(114, 186, 174, 0.1) 0%, rgba(43, 140, 123, 0.05) 100%);
                    border-bottom-color: rgba(114, 186, 174, 0.15);
                }

                .sakinah-notification-title {
                    color: #A8EBD8;
                    text-shadow: none;
                }

                .sakinah-notification-arabic {
                    color: #e8f8f3;
                    text-shadow: none;
                }

                .sakinah-notification-translation {
                    color: #b8c9c5;
                    background: linear-gradient(90deg, rgba(114, 186, 174, 0.08) 0%, transparent 100%);
                }

                .sakinah-notification-btn.secondary {
                    background: rgba(43, 140, 123, 0.15);
                    color: #A8EBD8;
                }

                .sakinah-notification-progress-container {
                    background: rgba(114, 186, 174, 0.1);
                }

                .sakinah-notification-timer {
                    background: rgba(0,0,0,0.4);
                    color: #72BAAE;
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
        const duration = options.duration || 12000;
        
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
        const duration = options.duration || 12000;
        
        notification.innerHTML = `
            <div class="sakinah-notification-card">
                <div class="sakinah-notification-header">
                    <div class="sakinah-notification-logo">
                        <span>🌙</span>
                    </div>
                    <div class="sakinah-notification-title-group">
                        <div class="sakinah-notification-title">سكينة Sakinah</div>
                        <div class="sakinah-notification-subtitle">✨ A verse of peace for your soul</div>
                    </div>
                    <button class="sakinah-notification-close" aria-label="Close" title="Dismiss">×</button>
                </div>
                <div class="sakinah-notification-content">
                    ${showArabic ? `<div class="sakinah-notification-arabic">${ayah.arabic || ''}</div>` : ''}
                    ${showTranslation ? `<div class="sakinah-notification-translation">"${ayah.translation || ''}"</div>` : ''}
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
                <div class="sakinah-notification-progress-container">
                    <div class="sakinah-notification-progress" style="animation-duration: ${duration}ms;"></div>
                </div>
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
                    
                    // Update button with animation
                    saveBtn.innerHTML = '<span>❤️</span> Saved!';
                    saveBtn.classList.add('saved');
                    saveBtn.style.transform = 'scale(1.05)';
                    setTimeout(() => { saveBtn.style.transform = ''; }, 200);
                    
                    setTimeout(() => {
                        this.hide(notification);
                    }, 1500);
                } else {
                    saveBtn.innerHTML = '<span>❤️</span> Already Saved';
                    saveBtn.classList.add('saved');
                }
            } catch (error) {
                console.error('Error saving ayah:', error);
                saveBtn.innerHTML = '<span>⚠️</span> Error';
            }
        });

        // Pause progress bar and timer on hover
        let remainingTime = null;
        let timerInterval = null;
        
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
            notificationDuration: 12000
        });

        const notifier = initNotificationSystem();
        
        const notificationOptions = {
            showArabic: settings.showArabic,
            showTranslation: settings.showTranslation,
            duration: options.duration || settings.notificationDuration || 12000,
            ...options
        };

        await notifier.show(ayah, notificationOptions);
        
        console.log('Content script: Elegant notification shown for ayah:', ayah.id);
    } catch (error) {
        console.error('Content script: Error showing elegant notification:', error);
    }
}

console.log('Sakinah content script loaded and ready');

} // End of duplicate prevention check
