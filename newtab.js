// newtab.js - Sakinah New Tab Experience

class SakinahNewTab {
    constructor() {
        this.settings = {};
        this.quranData = null;
        this.adhkarData = null;
        this.hadithData = null;
        this.hifdhData = null;
        this.hifdhMeta = null;
        this.normalizedHifdh = null;
        this.currentAyah = null;
        this.audio = null;
        this.aiGuide = (typeof sakinahAI !== 'undefined') ? sakinahAI : null;
        this.init();
    }

    async init() {
        await this.loadSettings();
        
        // If disabled, show the disabled state (minimal tab)
        if (!this.settings.newTabEnabled) {
            this.showDisabledState();
            this.setupDisabledEventListeners();
            return;
        }
        
        // Force random rotation as requested by user
        if (this.settings.ayahRotation === 'daily') {
            this.settings.ayahRotation = 'random';
            chrome.storage.sync.set({ ayahRotation: 'random' });
        }

        // Force quiz to be enabled as requested
        if (!this.settings.showQuiz) {
            this.settings.showQuiz = true;
            chrome.storage.sync.set({ showQuiz: true });
        }

        this.showEnabledState();
        await this.loadData();
        this.setupUI();
        this.loadBookmarks();
        this.loadRecentTabs();
        this.setupEventListeners();
        this.setupChatWidget();
        this.startClock();
    }

    async loadBookmarks() {
        const sidebarList = document.getElementById('sidebar-bookmarks-list');
        const otherSidebarList = document.getElementById('sidebar-other-bookmarks-list');
        if (!sidebarList) return;

        try {
            const tree = await chrome.bookmarks.getTree();
            if (!tree[0] || !tree[0].children) return;

            const bookmarksBar = tree[0].children[0] || { children: [] };
            const otherBookmarks = tree[0].children[1] || { children: [] };

            const renderItem = (node, isChild = false) => {
                const childClass = isChild ? 'child-item' : '';
                if (node.url) {
                    let hostname = '';
                    try { hostname = new URL(node.url).hostname; } catch (e) {}
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
                    return `
                        <a href="${node.url}" class="sidebar-item ${childClass}" title="${node.title}">
                            <img src="${faviconUrl}" 
                                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\'%3E%3C/circle%3E%3Cline x1=\'2\' y1=\'12\' x2=\'22\' y2=\'12\'%3E%3C/line%3E%3Cpath d=\'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\'%3E%3C/path%3E%3C/svg%3E';" 
                                 class="sidebar-icon" alt="">
                            <span class="sidebar-text">${node.title || node.url}</span>
                        </a>
                    `;
                } else if (node.children) {
                    // Folder
                    return `
                        <div class="sidebar-item folder-item ${childClass}" style="cursor: default; opacity: 0.8;">
                            <svg class="sidebar-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>
                            <span class="sidebar-text" style="font-weight: 600;">${node.title}</span>
                        </div>
                        ${node.children.map(child => renderItem(child, true)).join('')}
                    `;
                }
                return '';
            };

            // Populate Sidebar - Bookmarks Bar
            if (sidebarList) {
                sidebarList.innerHTML = bookmarksBar.children.map(node => renderItem(node)).join('');
            }

            // Populate Sidebar - Other Bookmarks
            if (otherSidebarList) {
                otherSidebarList.innerHTML = otherBookmarks.children.map(node => renderItem(node)).join('');
            }

        } catch (e) {
            console.error('Error loading bookmarks:', e);
        }
    }

    async removeRecentItem(url) {
        try {
            // 1. Add to local blacklist so it doesn't reappear
            const data = await chrome.storage.local.get(['recentBlacklist']);
            const blacklist = data.recentBlacklist || [];
            if (!blacklist.includes(url)) {
                blacklist.push(url);
                await chrome.storage.local.set({ recentBlacklist: blacklist });
            }

            // 2. Refresh the list
            await this.loadRecentTabs();
        } catch (e) {
            console.error('Error removing recent item:', e);
        }
    }

    async clearAllRecent() {
        try {
            const items = document.querySelectorAll('#recent-tabs-list .remove-item-btn');
            const urls = Array.from(items).map(btn => btn.dataset.url);
            
            if (urls.length === 0) return;

            const data = await chrome.storage.local.get(['recentBlacklist']);
            const blacklist = data.recentBlacklist || [];
            
            urls.forEach(url => {
                if (!blacklist.includes(url)) {
                    blacklist.push(url);
                }
            });

            await chrome.storage.local.set({ recentBlacklist: blacklist });
            await this.loadRecentTabs();
        } catch (e) {
            console.error('Error clearing recent items:', e);
        }
    }

    async loadRecentTabs() {
        const recentList = document.getElementById('recent-tabs-list');
        if (!recentList) return;

        console.log('Attempting to load recent tabs...');

        try {
            let recent = [];
            const seenUrls = new Set();
            
            // Get blacklist
            const blacklistData = await chrome.storage.local.get(['recentBlacklist']);
            const blacklist = blacklistData.recentBlacklist || [];

            // 1. Try Chrome History
            if (typeof chrome !== 'undefined' && chrome.history && chrome.history.search) {
                console.log('Fetching from history...');
                const historyItems = await new Promise(resolve => {
                    chrome.history.search({ text: '', maxResults: 50 }, (results) => {
                        if (chrome.runtime.lastError) {
                            console.warn('History API error:', chrome.runtime.lastError);
                            resolve([]);
                        } else {
                            resolve(results || []);
                        }
                    });
                });

                for (const item of historyItems) {
                    if (item.url && !seenUrls.has(item.url) && !blacklist.includes(item.url)) {
                        if (!item.url.startsWith('chrome://') && !item.url.startsWith('chrome-extension://')) {
                            recent.push({
                                url: item.url,
                                title: item.title || item.url
                            });
                            seenUrls.add(item.url);
                        }
                    }
                    if (recent.length >= 18) break;
                }
            }

            // 2. Fallback to Top Sites
            if (recent.length < 12 && typeof chrome !== 'undefined' && chrome.topSites && chrome.topSites.get) {
                console.log('Fetching from top sites...');
                const topSites = await new Promise(resolve => {
                    chrome.topSites.get((results) => {
                        if (chrome.runtime.lastError) {
                            console.warn('TopSites API error:', chrome.runtime.lastError);
                            resolve([]);
                        } else {
                            resolve(results || []);
                        }
                    });
                });
                for (const site of topSites) {
                    if (site.url && !seenUrls.has(site.url) && !blacklist.includes(site.url)) {
                        recent.push({ url: site.url, title: site.title });
                        seenUrls.add(site.url);
                    }
                    if (recent.length >= 18) break;
                }
            }

            console.log(`Found ${recent.length} recent items`);

            const clearBtn = document.getElementById('clear-recent-btn');
            if (clearBtn) {
                clearBtn.style.display = recent.length > 0 ? 'block' : 'none';
            }

            if (recent.length === 0) {
                recentList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; opacity: 0.6;">' +
                    '<p style="font-size: 0.8rem;">No recent activity found.</p>' +
                    '<p style="font-size: 0.7rem; margin-top: 5px;">Please ensure "History" permission is granted in extension settings.</p>' +
                '</div>';
                return;
            }

            recentList.innerHTML = recent.map(t => {
                let hostname = '';
                try { 
                    const url = new URL(t.url);
                    hostname = url.hostname; 
                } catch (e) { 
                    return ''; 
                }
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                return `
                <div class="link-item-container">
                    <a href="${t.url}" class="link-item" title="${t.title}">
                        <div class="link-icon">
                            <img src="${faviconUrl}" 
                                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\'%3E%3C/circle%3E%3Cline x1=\'2\' y1=\'12\' x2=\'22\' y2=\'12\'%3E%3C/line%3E%3Cpath d=\'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\'%3E%3C/path%3E%3C/svg%3E';"
                                 alt="">
                        </div>
                        <span class="link-label">${t.title || hostname}</span>
                    </a>
                    <button class="remove-item-btn" data-url="${t.url}" title="Remove from list">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `}).join('');

            // Add event listeners for remove buttons
            recentList.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = btn.dataset.url;
                    await this.removeRecentItem(url);
                });
            });
        } catch (e) {
            console.error('Error loading recent tabs:', e);
            recentList.innerHTML = '<span style="font-size: 0.7rem; opacity: 0.5; grid-column: 1/-1; text-align: center;">Unable to load activity.</span>';
        }
    }

    async loadSettings() {
        this.settings = await chrome.storage.sync.get(CONFIG.DEFAULT_SETTINGS);
    }

    showEnabledState() {
        document.getElementById('enabled-content').style.display = 'flex';
        document.getElementById('disabled-content').style.display = 'none';
    }

    showDisabledState() {
        document.getElementById('enabled-content').style.display = 'none';
        document.getElementById('disabled-content').style.display = 'flex';
        
        // Hide background elements
        const bgImage = document.getElementById('bg-image');
        const bgOverlay = document.getElementById('bg-overlay');
        if (bgImage) bgImage.style.display = 'none';
        if (bgOverlay) bgOverlay.style.display = 'none';
        
        document.querySelectorAll('.bg-blob').forEach(el => el.style.display = 'none');
        
        const sidebar = document.querySelector('.bookmarks-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        
        const chatWidget = document.getElementById('ai-chat-widget');
        if (chatWidget) chatWidget.style.display = 'none';
        
        // Set body background to a clean state
        document.body.style.background = 'none';
        document.body.style.backgroundColor = document.body.classList.contains('dark-mode') ? '#202124' : '#ffffff';
    }

    setupDisabledEventListeners() {
        const enableBtn = document.getElementById('enable-back-btn');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => {
                const optionalPermissions = ['bookmarks', 'sessions', 'topSites', 'history'];
                chrome.permissions.request({ permissions: optionalPermissions }, (granted) => {
                    chrome.storage.sync.set({ newTabEnabled: true }, () => {
                        window.location.reload();
                    });
                });
            });
        }
    }

    async loadData() {
        try {
            const loadFile = async (path) => {
                try {
                    const res = await fetch(chrome.runtime.getURL(path));
                    if (!res.ok) throw new Error(`Failed to load ${path}`);
                    return await res.json();
                } catch (e) {
                    console.error(`Error loading ${path}:`, e);
                    return null;
                }
            };

            const [quran, adhkar, hadith, hifdh, hifdhMeta] = await Promise.all([
                loadFile('quran.json'),
                loadFile('adhkar.json'),
                loadFile('ahadith.json'),
                loadFile('quran_hifdh.json'),
                loadFile('quran_hifdh_meta.json')
            ]);

            this.quranData = quran;
            this.adhkarData = adhkar;
            this.hadithData = hadith;
            this.hifdhData = hifdh;
            this.hifdhMeta = hifdhMeta;
            
            console.log('Data loaded:', { 
                quran: !!quran, 
                adhkar: !!adhkar, 
                hadith: !!hadith, 
                hifdh: !!hifdh,
                hifdhMeta: !!hifdhMeta
            });
            
            if (this.hifdhData) {
                this.normalizeHifdhData();
                // Provide the full Quran database to the AI Guide
                if (this.aiGuide && this.normalizedHifdh) {
                    this.aiGuide.setFullQuranDatabase(this.normalizedHifdh);
                }
            }

            // Re-run setupUI if data was loaded late
            this.setupUI();
        } catch (error) {
            console.error('Error in loadData:', error);
        }
    }

    normalizeHifdhData() {
        if (!this.hifdhData) return;
        let surahs = [];
        const raw = this.hifdhData;
        
        const keys = Object.keys(raw).filter(k => /^\d+$/.test(k)).sort((a,b)=>parseInt(a)-parseInt(b));
        keys.forEach(k => {
            const arr = raw[k] || [];
            const sNum = parseInt(k, 10);
            const ayahs = Array.isArray(arr) ? arr.map(a => ({
                numberInSurah: a.verse || a.verseNumber || a.ayah || 0,
                arabic: a.text || a.arabic || '',
                translation: a.translation || ''
            })) : [];
            
            let name = null;
            if (this.hifdhMeta && this.hifdhMeta.surahNames) {
                name = this.hifdhMeta.surahNames[sNum - 1];
            }
            
            surahs.push({ number: sNum, name, ayahs });
        });
        this.normalizedHifdh = { surahs };
        console.log('Normalized Hifdh data:', this.normalizedHifdh.surahs.length, 'surahs');
    }

    setupUI() {
        this.setupEcosystem();
        if (this.quranData) this.displayAyah();
        this.updateCalendar();
        this.loadAccountProfile();
        this.fetchPrayerTimes();
        this.loadHabits();
        this.loadGratitude();
        this.loadSunnahOfDay();
        this.setupBackground();
        this.applyDisplaySettings();
        
        const adhkarModule = document.getElementById('adhkar-module');
        if (adhkarModule) {
            // Show module if either Adhkar or Hadith is enabled/available
            if (this.settings.showAdhkar || this.hadithData) {
                adhkarModule.style.display = 'block';
                this.displayAdhkar();
                this.displayHadith();
            }
        }

        const quizModule = document.getElementById('quiz-module');
        if (quizModule) {
            if (this.settings.showQuiz) {
                quizModule.style.display = 'block';
                if (this.normalizedHifdh) {
                    this.displayQuiz();
                } else {
                    const questionEl = document.getElementById('quiz-question');
                    if (questionEl) questionEl.textContent = 'Loading quiz data...';
                }
            } else {
                quizModule.style.display = 'none';
            }
        }

        if (typeof translator !== 'undefined') {
            translator.applyLanguage();
        }
    }

    setupEcosystem() {
        const provider = this.settings.primaryEcosystem || 'google';
        const ecosystems = {
            google: {
                name: 'Google',
                searchUrl: 'https://www.google.com/search',
                searchPlaceholder: 'Search Google...',
                profileUrl: 'https://myaccount.google.com',
                links: [
                    { label: 'Gmail', url: 'https://mail.google.com' },
                    { label: 'Images', url: 'https://www.google.com/imghp' }
                ],
                apps: [
                    { name: 'Search', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
                    { name: 'Maps', url: 'https://maps.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/maps_96dp.png' },
                    { name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.gstatic.com/images/branding/product/1x/youtube_96dp.png' },
                    { name: 'Play', url: 'https://play.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/play_96dp.png' },
                    { name: 'News', url: 'https://news.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/news_96dp.png' },
                    { name: 'Gmail', url: 'https://mail.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/gmail_96dp.png' },
                    { name: 'Meet', url: 'https://meet.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/meet_96dp.png' },
                    { name: 'Drive', url: 'https://drive.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/drive_96dp.png' },
                    { name: 'Calendar', url: 'https://calendar.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/calendar_96dp.png' }
                ]
            },
            microsoft: {
                name: 'Microsoft',
                searchUrl: 'https://www.bing.com/search',
                searchPlaceholder: 'Search Bing...',
                profileUrl: 'https://account.microsoft.com',
                links: [
                    { label: 'Outlook', url: 'https://outlook.live.com' },
                    { label: 'Office', url: 'https://www.office.com' }
                ],
                apps: [
                    { name: 'Outlook', url: 'https://outlook.live.com', icon: 'https://res-1.cdn.office.net/assets/mail/pwa/v1/pngs/apple-touch-icon.png' },
                    { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'https://p.sfx.ms/icons/v2/OneDrive_96.png' },
                    { name: 'Word', url: 'https://www.office.com/launch/word', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/word_48x1.svg' },
                    { name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/excel_48x1.svg' },
                    { name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/powerpoint_48x1.svg' },
                    { name: 'OneNote', url: 'https://www.onenote.com', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/onenote_48x1.svg' },
                    { name: 'Teams', url: 'https://teams.microsoft.com', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/teams_48x1.svg' },
                    { name: 'Bing', url: 'https://www.bing.com', icon: 'https://www.bing.com/favicon.ico' },
                    { name: 'Skype', url: 'https://web.skype.com', icon: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/svg/skype_48x1.svg' }
                ]
            },
            apple: {
                name: 'Apple',
                searchUrl: 'https://www.google.com/search', // Apple doesn't have a search engine, usually defaults to Google
                searchPlaceholder: 'Search with Sakinah...',
                profileUrl: 'https://appleid.apple.com',
                links: [
                    { label: 'iCloud Mail', url: 'https://www.icloud.com/mail' },
                    { label: 'Photos', url: 'https://www.icloud.com/photos' }
                ],
                apps: [
                    { name: 'Mail', url: 'https://www.icloud.com/mail', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Contacts', url: 'https://www.icloud.com/contacts', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Calendar', url: 'https://www.icloud.com/calendar', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Photos', url: 'https://www.icloud.com/photos', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'iCloud Drive', url: 'https://www.icloud.com/iclouddrive', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Notes', url: 'https://www.icloud.com/notes', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Reminders', url: 'https://www.icloud.com/reminders', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Pages', url: 'https://www.icloud.com/pages', icon: 'https://www.icloud.com/favicon.ico' },
                    { name: 'Numbers', url: 'https://www.icloud.com/numbers', icon: 'https://www.icloud.com/favicon.ico' }
                ]
            }
        };

        const data = ecosystems[provider] || ecosystems.google;

        // Update Links
        const link1 = document.getElementById('nav-link-1');
        const link2 = document.getElementById('nav-link-2');
        if (link1 && data.links[0]) {
            link1.textContent = data.links[0].label;
            link1.href = data.links[0].url;
        }
        if (link2 && data.links[1]) {
            link2.textContent = data.links[1].label;
            link2.href = data.links[1].url;
        }

        // Update Search
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const disabledSearchForm = document.getElementById('disabled-search-form');
        const disabledSearchInput = document.getElementById('disabled-search-input');
        const appsBtn = document.getElementById('apps-btn');
        
        if (searchForm) searchForm.action = data.searchUrl;
        if (searchInput) {
            searchInput.placeholder = data.searchPlaceholder;
        }
        if (disabledSearchForm) disabledSearchForm.action = data.searchUrl;
        if (disabledSearchInput) {
            disabledSearchInput.placeholder = data.searchPlaceholder;
        }
        if (appsBtn) {
            appsBtn.title = `${data.name} Apps`;
        }

        // Update Apps Dropdown
        const appsDropdown = document.getElementById('apps-dropdown');
        if (appsDropdown) {
            appsDropdown.innerHTML = data.apps.map(app => `
                <a href="${app.url}" class="app-item">
                    <img src="${app.icon}" class="app-icon" onerror="this.src='icons/Sakinah.png'">
                    <span>${app.name}</span>
                </a>
            `).join('');
        }

        // Update Profile Link
        const profileBtn = document.getElementById('account-profile');
        if (profileBtn) {
            profileBtn.title = `${data.name} Account`;
        }
    }

    setupBackground() {
        const backgrounds = [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Beach
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', // Mountains
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470', // Lake
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Forest
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', // Nature
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', // Woods
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e', // Landscape
            'https://images.unsplash.com/photo-1518495973542-4542c06a5843', // Sun
            'https://images.unsplash.com/photo-1433086177607-6c22e3ca072d', // Waterfall
            'https://images.unsplash.com/photo-1500627845660-c716e797ef02'  // Valley
        ];

        const bgImage = document.getElementById('bg-image');
        const refreshBtn = document.getElementById('refresh-bg');

        const setRandomBackground = async () => {
            // Check for local uploaded wallpaper first
            const localData = await chrome.storage.local.get(['customWallpaperData']);
            if (localData.customWallpaperData) {
                this.applyWallpaper(localData.customWallpaperData);
                return;
            }

            if (this.settings.customWallpaper) {
                this.applyWallpaper(this.settings.customWallpaper);
                return;
            }

            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            const imgUrl = `${randomBg}?auto=format&fit=crop&w=1920&q=80`;
            this.applyWallpaper(imgUrl);
            await chrome.storage.local.set({ lastBackground: imgUrl });
        };

        // Load last background or set new one
        chrome.storage.local.get(['lastBackground', 'customWallpaperData'], (data) => {
            if (data.customWallpaperData) {
                this.applyWallpaper(data.customWallpaperData);
            } else if (this.settings.customWallpaper) {
                this.applyWallpaper(this.settings.customWallpaper);
            } else if (data.lastBackground && bgImage) {
                this.applyWallpaper(data.lastBackground);
            } else {
                setRandomBackground();
            }
        });

        if (refreshBtn) {
            refreshBtn.addEventListener('click', setRandomBackground);
        }

        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', async () => {
                const currentMode = this.settings.themeMode || 'auto';
                let newMode = 'dark';
                
                // If currently dark (either explicitly or via auto), switch to light
                if (document.body.classList.contains('dark-mode')) {
                    newMode = 'light';
                } else {
                    newMode = 'dark';
                }
                
                this.settings.themeMode = newMode;
                await chrome.storage.sync.set({ themeMode: newMode });
                this.updateTheme();
            });
        }

        // Wallpaper Customization Modal
        const customizeBtn = document.getElementById('customize-wallpaper-btn');
        const modal = document.getElementById('wallpaper-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        const saveBtn = document.getElementById('modal-save-btn');
        const clearBtn = document.getElementById('modal-clear-btn');
        const uploadBtn = document.getElementById('modal-upload-btn');
        const uploadInput = document.getElementById('modal-wallpaper-upload');
        const urlInput = document.getElementById('modal-wallpaper-url');

        if (customizeBtn && modal) {
            customizeBtn.addEventListener('click', () => {
                urlInput.value = this.settings.customWallpaper || '';
                modal.style.display = 'flex';
            });

            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });

            uploadBtn.addEventListener('click', () => uploadInput.click());

            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 5 * 1024 * 1024) {
                    alert('Image is too large. Please choose an image under 5MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64Data = event.target.result;
                    await chrome.storage.local.set({ customWallpaperData: base64Data });
                    this.settings.customWallpaper = ''; // Clear URL if uploading file
                    await chrome.storage.sync.set({ customWallpaper: '' });
                    this.setupBackground();
                    modal.style.display = 'none';
                };
                reader.readAsDataURL(file);
            });

            saveBtn.addEventListener('click', async () => {
                const url = urlInput.value.trim();
                this.settings.customWallpaper = url;
                await chrome.storage.sync.set({ customWallpaper: url });
                if (url) {
                    await chrome.storage.local.remove('customWallpaperData');
                }
                this.setupBackground();
                modal.style.display = 'none';
            });

            clearBtn.addEventListener('click', async () => {
                this.settings.customWallpaper = '';
                await chrome.storage.sync.set({ customWallpaper: '' });
                await chrome.storage.local.remove('customWallpaperData');
                this.setupBackground();
                modal.style.display = 'none';
            });
        }
    }

    applyWallpaper(url) {
        const bgImage = document.getElementById('bg-image');
        if (!bgImage) return;

        const img = new Image();
        img.src = url;
        img.onload = () => {
            bgImage.style.opacity = '0';
            setTimeout(() => {
                bgImage.style.backgroundImage = `url('${url}')`;
                bgImage.style.opacity = '1';
            }, 500);
        };
    }

    applyDisplaySettings() {
        // Apply Arabic Font
        const arabicElements = document.querySelectorAll('.arabic-text, .adhkar-arabic, .hadith-arabic, .sunnah-arabic, #quiz-question div, .quiz-option');
        const fontClass = this.settings.arabicFont || 'font-uthmani';
        
        arabicElements.forEach(el => {
            // Remove existing font classes
            el.classList.remove('font-uthmani', 'font-indopak', 'font-standard');
            el.classList.add(fontClass);
        });

        // Apply Theme Mode
        this.updateTheme();
    }

    updateTheme() {
        const mode = this.settings.themeMode || 'auto';
        const body = document.body;
        const sunIcon = document.getElementById('theme-icon-sun');
        const moonIcon = document.getElementById('theme-icon-moon');

        console.log('Applying theme mode:', mode);

        if (mode === 'dark') {
            body.classList.add('dark-mode');
        } else if (mode === 'light') {
            body.classList.remove('dark-mode');
        } else {
            // Auto mode
            this.checkAutoTheme();
        }

        // Update toggle icon
        if (sunIcon && moonIcon) {
            if (body.classList.contains('dark-mode')) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }
    }

    checkAutoTheme() {
        // Default to light if no prayer times yet
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

    setupEventListeners() {
        // Google Apps Dropdown
        const appsBtn = document.getElementById('apps-btn');
        const appsDropdown = document.getElementById('apps-dropdown');
        
        if (appsBtn && appsDropdown) {
            appsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                appsDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!appsDropdown.contains(e.target) && e.target !== appsBtn) {
                    appsDropdown.classList.remove('show');
                }
            });
        }

        const profileBtn = document.getElementById('account-profile');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                const provider = this.settings.primaryEcosystem || 'google';
                const urls = {
                    google: 'https://myaccount.google.com',
                    microsoft: 'https://account.microsoft.com',
                    apple: 'https://appleid.apple.com'
                };
                window.location.href = urls[provider] || urls.google;
            });
        }

        // Sidebar Search
        const sidebarSearch = document.getElementById('sidebar-search');
        if (sidebarSearch) {
            sidebarSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.bookmarks-sidebar .sidebar-item');
                
                items.forEach(item => {
                    const text = item.querySelector('.sidebar-text')?.textContent.toLowerCase() || '';
                    const isFolder = item.classList.contains('folder-item');
                    
                    if (isFolder) {
                        // For folders, we might want to keep them visible if they contain matches, 
                        // but for simplicity in a flat list search, we'll just hide them if they don't match
                        item.style.display = text.includes(query) ? 'flex' : 'none';
                    } else {
                        item.style.display = text.includes(query) ? 'flex' : 'none';
                    }
                });

                // Hide section titles if no items are visible in that section
                const sections = document.querySelectorAll('.bookmarks-sidebar .sidebar-section');
                sections.forEach(section => {
                    const visibleItems = section.querySelectorAll('.sidebar-item:not([style*="display: none"])');
                    section.style.display = visibleItems.length > 0 ? 'block' : 'none';
                });
            });
        }

        document.getElementById('customize-btn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            console.log('Refreshing content without reload');
            this.displayAyah(true);
            this.displayAdhkar();
            this.displayHadith();
            this.displayQuiz();
            
            // Optional: Add a small rotation animation to the icon
            const icon = document.querySelector('#refresh-btn svg');
            if (icon) {
                icon.style.transition = 'transform 0.5s ease';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 500);
            }
        });

        const refreshQuizBtn = document.getElementById('refresh-quiz-btn');
        if (refreshQuizBtn) {
            refreshQuizBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.displayQuiz();
            });
        }

        const clearRecentBtn = document.getElementById('clear-recent-btn');
        if (clearRecentBtn) {
            clearRecentBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all recent tabs?')) {
                    this.clearAllRecent();
                }
            });
        }

        const explainBtn = document.getElementById('explain-ayah-btn');
        if (explainBtn) {
            explainBtn.addEventListener('click', async () => {
                if (this.currentAyah && this.aiGuide) {
                    const tafsirEl = document.getElementById('ayah-tafsir');
                    if (!tafsirEl) return;

                    tafsirEl.style.display = 'block';
                    tafsirEl.innerHTML = '<div style="text-align:center; padding:10px; opacity: 0.7;">Generating spiritual insight (EN/AR)...</div>';
                    
                    try {
                        const explanation = await this.aiGuide.explainAyah(this.currentAyah);
                        tafsirEl.innerHTML = explanation.replace(/\n/g, '<br>');
                        
                        // Scroll to see the explanation if needed
                        tafsirEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } catch (error) {
                        console.error('AI Error:', error);
                        tafsirEl.textContent = "An error occurred while explaining the verse.";
                    }
                }
            });
        }

        const reciteBtn = document.getElementById('recite-ayah-btn');
        if (reciteBtn) {
            reciteBtn.addEventListener('click', () => {
                this.reciteAyah();
            });
        }

        // Listen for session changes (recently closed tabs)
        if (chrome.sessions && chrome.sessions.onChanged) {
            chrome.sessions.onChanged.addListener(() => {
                this.loadRecentTabs();
            });
        }

        // Also listen for tab removals to catch closed tabs immediately
        if (chrome.tabs && chrome.tabs.onRemoved) {
            chrome.tabs.onRemoved.addListener(() => {
                // Small delay to allow the session to be recorded
                setTimeout(() => this.loadRecentTabs(), 500);
            });
        }

        // Listen for storage changes to apply settings in real-time
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync') {
                if (changes.newTabEnabled) {
                    window.location.reload();
                    return;
                }
                this.loadSettings().then(() => {
                    this.applyDisplaySettings();
                    this.setupBackground();
                });
            } else if (area === 'local' && changes.customWallpaperData) {
                this.setupBackground();
            }
        });
    }

    setupChatWidget() {
        const toggle = document.getElementById('ai-chat-toggle');
        const window = document.getElementById('ai-chat-window');
        const close = document.getElementById('close-chat');
        const input = document.getElementById('ai-chat-input');
        const send = document.getElementById('send-chat');

        if (!toggle || !window) return;

        toggle.addEventListener('click', () => {
            const isVisible = window.style.display === 'flex';
            window.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) input.focus();
        });

        close.addEventListener('click', () => {
            window.style.display = 'none';
        });

        const handleSend = () => {
            const text = input.value.trim();
            if (text) {
                this.addChatMessage('user', text);
                input.value = '';
                this.handleChatInput(text);
            }
        };

        send.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    addChatMessage(role, text) {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `ai-message ${role}`;
        msg.innerHTML = text.replace(/\n/g, '<br>');
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    async handleChatInput(text) {
        if (!this.aiGuide) return;

        try {
            const ayahs = (this.quranData && this.quranData.ayahs) ? this.quranData.ayahs : [];
            const result = await this.aiGuide.getGuidance(text, ayahs);
            
            if (result.success) {
                let response = result.response;
                if (result.suggestedAyah) {
                    const ayah = result.suggestedAyah;
                    response += `<div style="padding: 10px; background: rgba(114, 186, 174, 0.1); border-radius: 10px; border-left: 3px solid var(--primary); margin-top: 10px; font-size: 0.8rem;">
                        <div style="font-family: 'Amiri', serif; font-size: 1rem; direction: rtl; margin-bottom: 5px;">${ayah.arabic}</div>
                        <div>${ayah.translation}</div>
                        <div style="font-weight: 600; color: var(--primary); margin-top: 3px;">${ayah.surah} ${ayah.surahNumber}:${ayah.ayahNumber}</div>
                    </div>`;
                }
                this.addChatMessage('bot', response);
            } else {
                this.addChatMessage('bot', "I'm sorry, I couldn't connect to the guidance system.");
            }
        } catch (error) {
            console.error('Chat Error:', error);
            this.addChatMessage('bot', "An error occurred. Please try again.");
        }
    }

    startClock() {
        let lastDay = new Date().getDate();
        let lastMinute = new Date().getMinutes();

        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            document.getElementById('clock').textContent = timeStr;

            const currentDay = now.getDate();
            const currentMinute = now.getMinutes();

            // 1. Every midnight: Refresh everything for the new day
            if (currentDay !== lastDay) {
                lastDay = currentDay;
                this.fetchPrayerTimes();
                this.updateCalendar();
                this.displayAyah();
                this.loadHabits();
                this.loadSunnahOfDay();
                console.log('Midnight refresh triggered');
            }

            // 2. Every minute: Update the "Active" prayer highlight
            if (currentMinute !== lastMinute) {
                lastMinute = currentMinute;
                if (this.lastTimings) {
                    this.updatePrayerTimesUI(this.lastTimings);
                }
            }

            // Update Day display
            const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            const dayIndex = now.getDay();
            const dayArEl = document.getElementById('current-day-ar');
            const dayEnEl = document.getElementById('current-day-en');
            
            if (dayArEl) dayArEl.textContent = daysAr[dayIndex];
            if (dayEnEl) dayEnEl.textContent = daysEn[dayIndex];
        };
        update();
        setInterval(update, 1000);
    }

    async updateCalendar() {
        const now = new Date();
        
        // Gregorian Date
        const gregMonthName = now.toLocaleString('en-US', { month: 'long' });
        const gregDay = now.getDate();
        const gregYear = now.getFullYear();
        document.getElementById('gregorian-date').textContent = `${gregMonthName} ${gregDay}, ${gregYear}`;

        try {
            // Fetch Hijri date from Aladhan API
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            
            // Note: Aladhan API endpoint is /gToH/{date}
            const apiUrl = `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}?calendarMethod=UAQ`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data && data.code === 200 && data.data) {
                const h = data.data.hijri;
                // Display in "Day Month Year" format
                document.getElementById('hijri-date').textContent = `${h.day} ${h.month.en} ${h.year}`;
                console.log('Hijri date updated via API');
            } else {
                throw new Error('API response error');
            }
        } catch (e) {
            console.warn('Failed to fetch Hijri date from API, falling back to local calculation:', e);
            this.updateCalendarFallback(now);
        }
    }

    async updateCalendarFallback(now) {
        try {
            // Hijri Date (Local Fallback)
            const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            document.getElementById('hijri-date').textContent = hijriFormatter.format(now);
        } catch (e) {
            console.error('Hijri calendar not supported locally', e);
            document.getElementById('hijri-date').style.display = 'none';
        }
    }

    async fetchPrayerTimes() {
        try {
            // If city and country are set in settings, use timingsByCity
            if (this.settings.prayerCity && this.settings.prayerCountry) {
                await this.getPrayerTimesByCity(this.settings.prayerCity, this.settings.prayerCountry);
                return;
            }

            // Try to get location from storage first
            let location = await chrome.storage.local.get(['userLocation']);
            
            if (!location.userLocation) {
                // Fallback to a default or try to detect
                // For now, let's use a default or try to get it
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    await chrome.storage.local.set({ userLocation: { lat, lng } });
                    this.getPrayerTimesFromAPI(lat, lng);
                }, (err) => {
                    console.warn('Geolocation failed, using default (Makkah):', err);
                    this.getPrayerTimesFromAPI(21.4225, 39.8262); // Makkah
                });
            } else {
                this.getPrayerTimesFromAPI(location.userLocation.lat, location.userLocation.lng);
            }
        } catch (e) {
            console.error('Error in fetchPrayerTimes:', e);
        }
    }

    async getPrayerTimesByCity(city, country) {
        try {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;
            
            const method = this.settings.prayerMethod || 3;
            const url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.code === 200) {
                this.updatePrayerTimesUI(data.data.timings);
                // Also update Hijri date from this response
                if (data.data.date && data.data.date.hijri) {
                    const h = data.data.date.hijri;
                    const hijriEl = document.getElementById('hijri-date');
                    if (hijriEl) hijriEl.textContent = `${h.day} ${h.month.en} ${h.year}`;
                }
            }
        } catch (e) {
            console.error('Failed to fetch prayer times by city:', e);
            // Fallback to coordinates if city fetch fails
            let location = await chrome.storage.local.get(['userLocation']);
            if (location.userLocation) {
                this.getPrayerTimesFromAPI(location.userLocation.lat, location.userLocation.lng);
            }
        }
    }

    async getPrayerTimesFromAPI(lat, lng) {
        try {
            const method = this.settings.prayerMethod || 3;
            const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && data.code === 200) {
                this.updatePrayerTimesUI(data.data.timings);
                // Also update Hijri date from this response
                if (data.data.date && data.data.date.hijri) {
                    const h = data.data.date.hijri;
                    const hijriEl = document.getElementById('hijri-date');
                    if (hijriEl) hijriEl.textContent = `${h.day} ${h.month.en} ${h.year}`;
                }
            }
        } catch (e) {
            console.error('Failed to fetch prayer times:', e);
        }
    }

    updatePrayerTimesUI(timings) {
        this.lastTimings = timings; // Store for periodic highlight updates
        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let nextPrayer = null;
        let minDiff = Infinity;

        prayers.forEach(p => {
            const timeStr = timings[p];
            const el = document.getElementById(`prayer-${p.toLowerCase()}`);
            if (el) {
                const timeSpan = el.querySelector('.prayer-time');
                if (timeSpan) timeSpan.textContent = timeStr;

                // Calculate next prayer
                const [hours, minutes] = timeStr.split(':').map(Number);
                const prayerMinutes = hours * 60 + minutes;
                
                el.classList.remove('active');
                
                const diff = prayerMinutes - currentTime;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextPrayer = el;
                }
            }
        });

        // If no next prayer today, the next one is Fajr tomorrow
        if (!nextPrayer) {
            const fajrEl = document.getElementById('prayer-fajr');
            if (fajrEl) fajrEl.classList.add('active');
        } else {
            nextPrayer.classList.add('active');
        }

        // Update theme based on Maghrib if in auto mode
        if (this.settings.themeMode === 'auto' && timings.Maghrib) {
            const [mHours, mMinutes] = timings.Maghrib.split(':').map(Number);
            const [fHours, fMinutes] = timings.Fajr.split(':').map(Number);
            const maghribTime = mHours * 60 + mMinutes;
            const fajrTime = fHours * 60 + fMinutes;

            if (currentTime >= maghribTime || currentTime < fajrTime) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    }

    async loadHabits() {
        const today = new Date().toDateString();
        const data = await chrome.storage.local.get(['habits', 'habitsDate']);
        
        let habits = data.habits || {};
        if (data.habitsDate !== today) {
            habits = {}; // Reset for new day
            await chrome.storage.local.set({ habits: {}, habitsDate: today });
        }

        const habitListContainer = document.getElementById('habit-list');
        if (!habitListContainer) return;

        // Clear existing static items
        habitListContainer.innerHTML = '';

        // Render deeds from settings
        const deeds = this.settings.deeds || [
            "5 Daily Prayers",
            "Read Quran",
            "Morning/Evening Adhkar",
            "Act of Kindness",
            "Give Charity"
        ];

        deeds.forEach((deed, index) => {
            if (!deed) return;
            
            const habitId = `deed-${index}`;
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            if (habits[habitId]) {
                habitItem.classList.add('completed');
            }
            habitItem.dataset.habit = habitId;

            habitItem.innerHTML = `
                <div class="habit-checkbox"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span class="habit-name">${deed}</span>
            `;

            habitItem.addEventListener('click', async () => {
                const isCompleted = habitItem.classList.toggle('completed');
                habits[habitId] = isCompleted;
                await chrome.storage.local.set({ habits });
            });

            habitListContainer.appendChild(habitItem);
        });
    }

    async loadGratitude() {
        const today = new Date().toDateString();
        const data = await chrome.storage.local.get(['gratitudeHistory']);
        const history = data.gratitudeHistory || {};
        
        const input = document.getElementById('gratitude-input');
        const saveBtn = document.getElementById('save-gratitude-btn');
        const viewHistoryBtn = document.getElementById('view-gratitude-history-btn');
        const historyModal = document.getElementById('gratitude-modal');
        const closeHistoryBtn = document.getElementById('close-gratitude-modal-btn');
        const historyList = document.getElementById('gratitude-history-list');
        const downloadBtn = document.getElementById('download-gratitude-btn');
        
        if (!input || !saveBtn || !viewHistoryBtn || !historyModal || !closeHistoryBtn || !historyList || !downloadBtn) return;

        // Load today's entry if it exists
        if (history[today]) {
            input.value = history[today];
        }

        saveBtn.addEventListener('click', async () => {
            const text = input.value.trim();
            if (!text) return;

            history[today] = text;
            await chrome.storage.local.set({ gratitudeHistory: history });
            
            saveBtn.textContent = 'Saved! ✨';
            setTimeout(() => { saveBtn.textContent = 'Save Entry'; }, 2000);
        });

        const updateHistoryUI = () => {
            historyList.innerHTML = '';
            const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
            
            if (sortedDates.length === 0) {
                historyList.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 20px;">No entries yet. Start writing today!</div>';
                return;
            }

            const isDark = document.body.classList.contains('dark-mode');
            sortedDates.forEach(date => {
                const item = document.createElement('div');
                item.style.padding = '12px';
                item.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                item.style.borderRadius = '12px';
                item.style.fontSize = '0.85rem';
                item.style.border = '1px solid var(--glass-border)';
                
                const isToday = date === today;
                item.innerHTML = `
                    <div style="font-weight: 700; color: var(--primary-dark); margin-bottom: 5px; font-size: 0.75rem; display: flex; justify-content: space-between;">
                        <span>${date}${isToday ? ' (Today)' : ''}</span>
                    </div>
                    <div style="line-height: 1.4; color: var(--text-main); white-space: pre-wrap;">${history[date]}</div>
                `;
                historyList.appendChild(item);
            });
        };

        viewHistoryBtn.addEventListener('click', () => {
            updateHistoryUI();
            historyModal.style.display = 'flex';
        });

        closeHistoryBtn.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });

        downloadBtn.addEventListener('click', () => {
            const sortedDates = Object.keys(history).sort((a, b) => new Date(a) - new Date(b));
            let content = "SAKINAH GRATITUDE JOURNAL\n==========================\n\n";
            
            sortedDates.forEach(date => {
                content += `${date}\n---\n${history[date]}\n\n`;
            });

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sakinah-gratitude-journal-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Close modal on outside click
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) historyModal.style.display = 'none';
        });
    }

    loadSunnahOfDay() {
        const sunnahs = [
            { 
                arabic: 'السواك عند كل صلاة',
                title: 'Using the Siwak', 
                description: 'استخدام السواك قبل كل صلاة للحفاظ على الطهارة.\nUsing the Siwak before every Salah to maintain purity.' 
            },
            { 
                arabic: 'التبسم في وجه أخيك',
                title: 'Smiling', 
                description: 'التبسم في وجه الآخرين صدقة.\nSmiling at others is a form of charity (Sadaqah).' 
            },
            { 
                arabic: 'النوم على الشق الأيمن',
                title: 'Sleeping on the Right', 
                description: 'النوم على الجانب الأيمن اتباعاً للسنة النبوية.\nSleeping on your right side following the prophetic tradition.' 
            },
            { 
                arabic: 'التسمية عند دخول البيت',
                title: 'Bismillah upon Entering', 
                description: 'قول بسم الله عند دخول المنزل لجلب البركة.\nSaying Bismillah when entering your home for barakah.' 
            },
            { 
                arabic: 'الوضوء قبل النوم',
                title: 'Wudu before Sleep', 
                description: 'الوضوء قبل الذهاب إلى الفراش للبقاء على طهارة.\nPerforming Wudu before going to bed to stay in a state of purity.' 
            },
            { 
                arabic: 'الشرب جالساً',
                title: 'Drinking while Sitting', 
                description: 'شرب الماء جالساً وعلى ثلاث دفعات.\nDrinking water while sitting and in three breaths.' 
            },
            { 
                arabic: 'البدء باليمين',
                title: 'Starting with the Right', 
                description: 'البدء دائماً بالجانب الأيمن عند اللبس أو دخول المسجد.\nAlways starting with the right side when dressing or entering the Masjid.' 
            },
            { 
                arabic: 'إفشاء السلام',
                title: 'Spreading Salaam', 
                description: 'إلقاء السلام على من تعرف ومن لا تعرف.\nOffering Salaam to those you know and those you do not know.' 
            },
            { 
                arabic: 'إماطة الأذى عن الطريق',
                title: 'Removing Harm', 
                description: 'إزالة الأذى عن الطريق شعبة من شعب الإيمان.\nRemoving a harmful object from the path is a branch of faith.' 
            },
            { 
                arabic: 'التسميت عند العطاس',
                title: 'Sneezing Etiquette', 
                description: 'قول الحمد لله بعد العطاس واتباع سنن الاستجابة.\nSaying Alhamdulillah after sneezing and following the sunnah responses.' 
            }
        ];

        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const sunnah = sunnahs[dayOfYear % sunnahs.length];

        const arabicEl = document.getElementById('sunnah-arabic');
        const titleEl = document.getElementById('sunnah-title');
        const descriptionEl = document.getElementById('sunnah-description');

        if (arabicEl) arabicEl.textContent = sunnah.arabic;
        if (titleEl) titleEl.textContent = sunnah.title;
        if (descriptionEl) {
            descriptionEl.innerHTML = sunnah.description.replace(/\n/g, '<br>');
        }
    }

    async loadAccountProfile() {
        try {
            // Try to get user info from Chrome Identity API
            if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
                chrome.identity.getProfileUserInfo({ privacy: 'CLOAKED' }, (userInfo) => {
                    if (userInfo && userInfo.email) {
                        console.log('User signed in:', userInfo.email);
                        const profileBtn = document.getElementById('account-profile');
                        if (profileBtn) {
                            const provider = this.settings.primaryEcosystem || 'google';
                            const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
                            profileBtn.title = `${providerName} Account (${userInfo.email})`;
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('Account Profile loading failed:', e);
        }
    }

    displayAyah(forceRandom = false) {
        if (!this.quranData || !this.quranData.ayahs) {
            console.warn('Quran data not loaded yet, cannot display ayah');
            return;
        }

        const ayahs = this.quranData.ayahs;
        const forceRandomSession = sessionStorage.getItem('forceRandomAyah') === 'true';
        
        console.log('Displaying Ayah. forceRandom:', forceRandom, 'forceRandomSession:', forceRandomSession, 'Rotation:', this.settings.ayahRotation);

        if (forceRandomSession) {
            sessionStorage.removeItem('forceRandomAyah');
        }

        if (forceRandom || forceRandomSession || this.settings.ayahRotation === 'random') {
            this.currentAyah = ayahs[Math.floor(Math.random() * ayahs.length)];
        } else if (this.settings.ayahRotation === 'daily') {
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
            this.currentAyah = ayahs[dayOfYear % ayahs.length];
        } else {
            this.currentAyah = ayahs.find(a => a.id === this.settings.fixedAyahId) || ayahs[0];
        }

        const ayah = this.currentAyah;
        console.log('Selected Ayah:', ayah.surah, ayah.surahNumber + ':' + ayah.ayahNumber);

        const arabicEl = document.getElementById('ayah-arabic');
        const translationEl = document.getElementById('ayah-translation');
        const referenceEl = document.getElementById('ayah-reference');
        const themeEl = document.getElementById('ayah-theme');
        const tafsirEl = document.getElementById('ayah-tafsir');
        
        if (arabicEl) arabicEl.style.opacity = 0;
        if (translationEl) translationEl.style.opacity = 0;

        setTimeout(() => {
            if (arabicEl) {
                arabicEl.textContent = ayah.arabic;
                arabicEl.style.transition = 'opacity 0.8s ease';
                arabicEl.style.opacity = 1;
            }
            if (translationEl) {
                translationEl.textContent = ayah.translation;
                translationEl.style.transition = 'opacity 0.8s ease';
                translationEl.style.opacity = 1;
            }
            if (referenceEl) referenceEl.textContent = `${ayah.surah} ${ayah.surahNumber}:${ayah.ayahNumber}`;
            if (themeEl) themeEl.textContent = ayah.theme || '';
            
            if (tafsirEl) {
                if (ayah.emotions && ayah.emotions.length > 0) {
                    tafsirEl.textContent = `Reflect on: ${ayah.emotions.join(', ')}`;
                } else {
                    tafsirEl.textContent = '';
                }
            }
        }, 400);
    }

    getAyahNumber(surahNum, verseNum) {
        const ayahCounts = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
        let absoluteNum = 0;
        for (let i = 0; i < surahNum - 1 && i < ayahCounts.length; i++) {
            absoluteNum += ayahCounts[i];
        }
        absoluteNum += verseNum;
        return absoluteNum;
    }

    mapReciterId(id) {
        const mapping = {
            'Alafasy_128kbps': 'ar.alafasy',
            'Abdul_Basit_Murattal_192kbps': 'ar.abdulbasit',
            'Abdurrahmaan_As-Sudais_192kbps': 'ar.sudais',
            'Maher_AlMuaiqly_64kbps': 'ar.mahermuaiqly',
            'Minshawi_Murattal_128kbps': 'ar.minshawi',
            'Ahmed_ibn_Ali_al-Ajamy_128kbps': 'ar.ahmedajamy',
            'Ghamadi_40kbps': 'ar.alafasy'
        };
        return mapping[id] || id;
    }

    reciteAyah() {
        if (!this.currentAyah) return;

        const btn = document.getElementById('recite-ayah-btn');
        
        // If already playing, stop it
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.audio.currentTime = 0;
            if (btn) {
                btn.classList.remove('playing');
                const text = translator.get('hifdh.listen');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> ${text}`;
            }
            return;
        }

        const reciter = this.mapReciterId(this.settings.reciter || 'ar.alafasy');
        const absoluteAyahNum = this.getAyahNumber(this.currentAyah.surahNumber, this.currentAyah.ayahNumber);
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${absoluteAyahNum}.mp3`;

        if (btn) {
            btn.classList.add('playing');
            const text = translator.get('common.stop');
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> ${text}`;
        }

        this.audio = new Audio(audioUrl);
        this.audio.play().catch(err => {
            console.error('Audio playback failed:', err);
            if (btn) {
                btn.classList.remove('playing');
                const text = translator.get('hifdh.listen');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> ${text}`;
            }
        });

        this.audio.onended = () => {
            if (btn) {
                btn.classList.remove('playing');
                const text = translator.get('hifdh.listen');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> ${text}`;
            }
        };
    }

    displayAdhkar() {
        const content = document.querySelector('.adhkar-content');
        if (!this.adhkarData || !this.adhkarData.adhkar) {
            if (content) content.style.display = 'none';
            return;
        }

        const items = this.adhkarData.adhkar;
        const randomItem = items[Math.floor(Math.random() * items.length)];

        const arabicEl = document.getElementById('adhkar-arabic');
        const translationEl = document.getElementById('adhkar-translation');
        
        if (arabicEl) arabicEl.textContent = randomItem.arabic;
        if (translationEl) translationEl.textContent = randomItem.translation;
    }

    displayHadith() {
        const content = document.querySelector('.hadith-content');
        const separator = document.querySelector('.module-separator');
        
        if (!this.hadithData || !this.hadithData.hadiths) {
            if (content) content.style.display = 'none';
            if (separator) separator.style.display = 'none';
            return;
        }

        const items = this.hadithData.hadiths;
        const randomItem = items[Math.floor(Math.random() * items.length)];

        const arabicEl = document.getElementById('hadith-arabic');
        const translationEl = document.getElementById('hadith-translation');
        const sourceEl = document.getElementById('hadith-source');

        if (arabicEl) arabicEl.textContent = randomItem.arabic_text;
        if (translationEl) translationEl.textContent = randomItem.english_translation;
        if (sourceEl) sourceEl.textContent = randomItem.source;
        
        // Only show separator if both Adhkar and Hadith are visible
        if (separator) {
            const adhkarVisible = this.adhkarData && this.adhkarData.adhkar;
            separator.style.display = adhkarVisible ? 'block' : 'none';
        }
    }

    displayQuiz() {
        if (!this.normalizedHifdh || !this.normalizedHifdh.surahs || this.normalizedHifdh.surahs.length === 0) return;

        const surahs = this.normalizedHifdh.surahs;
        let surah, ayah, ayahIndex;
        let attempts = 0;
        
        // Find a suitable ayah for the question
        do {
            const sIdx = Math.floor(Math.random() * surahs.length);
            surah = surahs[sIdx];
            if (surah && surah.ayahs && surah.ayahs.length > 0) {
                ayahIndex = Math.floor(Math.random() * surah.ayahs.length);
                ayah = surah.ayahs[ayahIndex];
            }
            attempts++;
        } while ((!ayah || !ayah.arabic || ayah.arabic.split(' ').length < 4) && attempts < 50);

        if (!ayah || !ayah.arabic) return;

        const questionEl = document.getElementById('quiz-question');
        const optionsEl = document.getElementById('quiz-options');
        const feedbackEl = document.getElementById('quiz-feedback');

        if (!questionEl || !optionsEl || !feedbackEl) return;

        const words = ayah.arabic.split(' ');
        const splitPoint = Math.max(1, Math.floor(words.length / 2));
        const promptText = words.slice(0, splitPoint).join(' ');
        const correctHalf = words.slice(splitPoint).join(' ');

        if (!correctHalf) return;

        questionEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--primary); margin-bottom: 5px;">Complete the verse (${surah.name || 'Surah ' + surah.number} ${ayah.numberInSurah}):</div><div style="font-family: 'Amiri', serif; font-size: 1.3rem; direction: rtl;">${promptText}...</div>`;
        optionsEl.innerHTML = '';
        feedbackEl.style.display = 'none';

        const options = [{ text: correctHalf, correct: true }];
        let optionAttempts = 0;
        
        // Try to find 2 wrong options
        while (options.length < 3 && optionAttempts < 100) {
            optionAttempts++;
            // Pick a random surah and ayah for variety
            const rSIdx = Math.floor(Math.random() * surahs.length);
            const rSurah = surahs[rSIdx];
            if (!rSurah || !rSurah.ayahs || rSurah.ayahs.length === 0) continue;
            
            const rAyah = rSurah.ayahs[Math.floor(Math.random() * rSurah.ayahs.length)];
            if (!rAyah || !rAyah.arabic) continue;
            
            const rWords = rAyah.arabic.split(' ');
            if (rWords.length < 2) continue;
            
            const rSplit = Math.max(1, Math.floor(rWords.length / 2));
            const rHalf = rWords.slice(rSplit).join(' ');
            
            if (rHalf && rHalf !== correctHalf && !options.find(o => o.text === rHalf)) {
                options.push({ text: rHalf, correct: false });
            }
        }

        // If we couldn't find enough options, just show what we have (or skip)
        if (options.length < 2) return;

        options.sort(() => Math.random() - 0.5);

        options.forEach((opt) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.style.fontFamily = "'Amiri', serif";
            btn.style.fontSize = "1.1rem";
            btn.style.direction = "rtl";
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                if (feedbackEl.style.display === 'block') return;

                if (opt.correct) {
                    btn.style.background = 'rgba(40, 167, 69, 0.2)';
                    btn.style.borderColor = '#28a745';
                    feedbackEl.textContent = `✨ Correct! MashaAllah.`;
                    feedbackEl.style.background = 'rgba(212, 237, 218, 0.8)';
                    feedbackEl.style.color = '#155724';
                } else {
                    btn.style.background = 'rgba(220, 53, 69, 0.2)';
                    btn.style.borderColor = '#dc3545';
                    feedbackEl.textContent = `💡 The correct completion was: ${correctHalf}`;
                    feedbackEl.style.background = 'rgba(248, 215, 218, 0.8)';
                    feedbackEl.style.color = '#721c24';
                }
                feedbackEl.style.display = 'block';
            });
            optionsEl.appendChild(btn);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SakinahNewTab();
});
