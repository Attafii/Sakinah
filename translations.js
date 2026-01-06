// Sakinah Extension - Translations
// Complete English and Arabic translations for all UI elements

const TRANSLATIONS = {
    en: {
        // Popup - Main Interface
        popup: {
            title: "Sakinah",
            subtitle: "Find peace through the Qur'an",
            randomAyah: "Random Ayah",
            ahadith: "Ahadith",
            aiGuide: "AI Guide",
            favorites: "Favorites",
            hifdh: "Hifdh Progress",
            settings: "Settings",
            loading: "Loading...",
            refresh: "Refresh",
            addToFavorites: "Add to Favorites",
            removeFromFavorites: "Remove from Favorites",
            explainAyah: "Explain this Ayah",
            close: "Close",
            search: "Search",
            searchPlaceholder: "Search Ayahs...",
            noResults: "No results found",
            error: "An error occurred",
            tryAgain: "Try again",
            footer: "May Allah grant you peace and tranquility",
        },
        
        // Random Ayah Section
        ayah: {
            surah: "Surah",
            ayah: "Ayah",
            reference: "Reference",
            translation: "Translation",
            tafsir: "Explanation",
            noAyah: "No Ayah loaded",
        },
        
        // Ahadith Section
        hadith: {
            title: "Ahadith Collections",
            nawawi40: "40 Hadith of Imam An-Nawawi",
            qudsi40: "40 Hadith Qudsi",
            shahwaliullah40: "40 Hadith of Shah Waliullah",
            hadithNumber: "Hadith",
            narrator: "Narrator",
            arabic: "Arabic",
            english: "English",
            reference: "Reference",
            allCollections: "All Collections",
            bukhari: "Sahih al-Bukhari",
            muslim: "Sahih Muslim",
        },
        
        // AI Guide Section
        aiGuide: {
            title: "AI Spiritual Guide",
            placeholder: "How are you feeling? Describe your emotional state...",
            inputPlaceholder: "Type your message here... (Press Enter to send)",
            examplePrompts: "Example prompts:",
            example1: "I'm feeling anxious about the future",
            example2: "I need guidance on patience",
            example3: "Help me find peace in difficult times",
            askButton: "Get Guidance",
            analyzing: "Analyzing your feelings...",
            response: "AI Response",
            suggestedAyahs: "Suggested Ayahs",
            noResponse: "No response yet",
        },
        
        // Favorites Section
        favorites: {
            title: "My Favorites",
            yourFavorites: "Your Favorites",
            empty: "No favorites yet",
            emptyDesc: "Add Ayahs to your favorites to see them here",
            analyze: "Analyze Favorites",
            analyzing: "Analyzing your favorites...",
            insights: "Insights",
            clear: "Clear All",
            confirmClear: "Are you sure you want to remove all favorites?",
            open: "Open",
            remove: "Remove",
            export: "Export",
        },
        
        // Hifdh Progress Section
        hifdh: {
            title: "Hifdh Progress",
            totalProgress: "Total Progress",
            surahs: "Surahs",
            ayahs: "Ayahs",
            lastUpdated: "Last updated",
            surahName: "Surah Name",
            progress: "Progress",
            completed: "Completed",
            memorize: "Memorize",
            review: "Review",
            markComplete: "Mark as Complete",
            markIncomplete: "Mark as Incomplete",
            filter: "Filter",
            all: "All",
            inProgress: "In Progress",
            completedOnly: "Completed",
            search: "Search Surahs...",
            reset: "Reset Progress",
            quizGame: "Quiz Game",
            quiz: "Quiz",
            listen: "Listen",
            markMemorized: "Mark Memorized",
            score: "Score",
            streak: "Streak",
            quizPrompt: "Complete the verse - what comes next?",
            prev: "Prev",
            next: "Next",
            memorized: "Memorized",
            play: "Play",
            repeat: "Repeat",
            ayahOf: "Ayah {current} of {total}",
            nextQuestion: "Next Question",
            perfectKeepGoing: "Perfect! Keep going!",
            excellentMashallah: "Excellent! Masha'Allah!",
            amazingGotIt: "Amazing! You got it!",
            brilliantWellDone: "Brilliant! Well done!",
            notQuiteCorrect: "Not quite! The correct answer is highlighted above.",
        },
        
        // Options Page
        options: {
            title: "Settings",
            subtitle: "Configure Sakinah Extension",
            
            // New Tab Settings
            newTabSection: "New Tab Experience",
            enableNewTab: "Enable Sakinah New Tab",
            newTabDesc: "Replace Chrome's default new tab with a calm Islamic interface",
            showAdhkar: "Show Adhkar module",
            showQuiz: "Show Daily Quiz module",
            ayahRotation: "Ayah Rotation",
            daily: "Daily",
            random: "Random",
            fixed: "Fixed",
            
            // New Tab UI
            newtab: {
                subtitle: "A calm beginning",
                customize: "Customize New Tab",
                enableSakinah: "Enable Sakinah New Tab",
                disabledTitle: "Sakinah is resting",
                disabledDesc: "The Islamic New Tab experience is currently disabled.",
                searchPlaceholder: "Search with peace...",
                dailyQuiz: "Daily Quiz",
                dailyAdhkar: "Daily Adhkar",
                favorites: "Favorites",
                recentTabs: "Recent Tabs"
            },
            
            // Notification Settings
            notificationSection: "Notification Schedule",
            enableNotifications: "Enable notifications",
            notificationType: "Notification Type",
            intervalBased: "Interval-based",
            customTimes: "Custom times",
            both: "Both",
            notificationInterval: "Notification Interval",
            minutes: "minutes",
            customTimesLabel: "Custom Notification Times",
            addTime: "Add Time",
            removeTime: "Remove",
            quietHours: "Quiet Hours",
            quietStart: "Start",
            quietEnd: "End",
            
            // Display Settings
            displaySection: "Display Settings",
            showArabic: "Show Arabic text",
            showTranslation: "Show English translation",
            showSurahInfo: "Show Surah information",
            fontSize: "Font Size",
            small: "Small",
            medium: "Medium",
            large: "Large",
            
            // Recitation Settings
            recitationSection: "Recitation Settings",
            reciter: "Reciter",
            
            // AI Guide Settings
            aiSection: "AI Guide Preferences",
            aiAlwaysEnabled: "Advanced AI analysis with Groq API is always enabled for enhanced emotion analysis and accurate Ayah suggestions.",
            detailedExplanations: "Show detailed explanations",
            contextHistory: "Remember conversation context",
            responseStyle: "Response Style",
            concise: "Concise",
            detailed: "Detailed",
            scholarly: "Scholarly",
            explanationLanguage: "Explanation Language",
            english: "English",
            arabic: "العربية (Arabic)",
            
            // Privacy Settings
            privacySection: "Privacy Settings",
            offlineMode: "Offline mode (local AI only)",
            anonymousUsage: "Anonymous usage statistics",
            
            // Actions
            saveSettings: "Save Settings",
            exportSettings: "Export Settings",
            importSettings: "Import Settings",
            resetSettings: "Reset to Defaults",
            showOnboarding: "Show Onboarding",
            settingsSaved: "Settings saved successfully!",
            settingsReset: "Settings reset to defaults",
            
            // Language Settings
            languageSection: "Language Settings",
            interfaceLanguage: "Interface Language",
            changeLanguage: "Change Language",
        },
        
        // Notification Popup
        notification: {
            title: "Sakinah - Ayah of the moment",
            openExtension: "Open Extension",
        },
        
        // Common UI Elements
        common: {
            yes: "Yes",
            no: "No",
            cancel: "Cancel",
            confirm: "Confirm",
            ok: "OK",
            back: "Back",
            next: "Next",
            previous: "Previous",
            save: "Save",
            stop: "Stop",
            delete: "Delete",
            edit: "Edit",
            copy: "Copy",
            share: "Share",
            more: "More",
            less: "Less",
            to: "to",
            clear: "Clear Chat",
        },
        
        // Onboarding
        onboarding: {
            welcome: "Welcome to Sakinah",
            welcomeText: "Your spiritual companion for finding peace through the Qur'an",
            feature1Title: "Random Ayahs",
            feature1Desc: "Receive beautiful verses throughout your day",
            feature2Title: "AI Spiritual Guide",
            feature2Desc: "Get personalized guidance based on your emotions",
            feature3Title: "Hifdh Progress",
            feature3Desc: "Track your Quran memorization journey",
            feature4Title: "New Tab Experience",
            feature4Desc: "A calm Islamic interface for your daily computer use",
            getStarted: "Get Started",
            chooseLanguage: "Choose Your Language",
            languageText: "Select your preferred interface language",
            language: "Language",
            chooseTimezone: "Choose Your Timezone",
            timezoneText: "This helps us send notifications at the right time",
            detectedTimezone: "Detected Timezone:",
            timezone: "Timezone",
            finish: "Finish Setup",
            preferences: "Preferences",
            preferencesText: "Customize your experience",
            aiResponseStyle: "AI Response Style",
            explanationLanguage: "Explanation Language",
            concise: "Concise",
            detailed: "Detailed",
            scholarly: "Scholarly",
            english: "English",
            arabic: "Arabic",
        },
    },
    
    ar: {
        // Popup - Main Interface
        popup: {
            title: "سكينة",
            subtitle: "اعثر على السكينة من خلال القرآن",
            randomAyah: "آية عشوائية",
            ahadith: "الأحاديث",
            aiGuide: "المرشد الذكي",
            favorites: "المفضلة",
            hifdh: "تقدم الحفظ",
            settings: "الإعدادات",
            loading: "جاري التحميل...",
            refresh: "تحديث",
            addToFavorites: "أضف إلى المفضلة",
            removeFromFavorites: "إزالة من المفضلة",
            explainAyah: "شرح هذه الآية",
            close: "إغلاق",
            search: "بحث",
            searchPlaceholder: "البحث عن الآيات...",
            noResults: "لم يتم العثور على نتائج",
            error: "حدث خطأ",
            tryAgain: "حاول مرة أخرى",
            footer: "جعل الله لك السكينة والطمأنينة",
        },
        
        // Random Ayah Section
        ayah: {
            surah: "السورة",
            ayah: "الآية",
            reference: "المرجع",
            translation: "الترجمة",
            tafsir: "التفسير",
            noAyah: "لم يتم تحميل آية",
        },
        
        // Ahadith Section
        hadith: {
            title: "مجموعات الأحاديث",
            nawawi40: "الأربعون النووية",
            qudsi40: "الأحاديث القدسية الأربعون",
            shahwaliullah40: "أربعون حديثاً للشاه ولي الله",
            hadithNumber: "الحديث",
            narrator: "الراوي",
            arabic: "العربية",
            english: "الإنجليزية",
            reference: "المرجع",
            allCollections: "جميع المجموعات",
            bukhari: "صحيح البخاري",
            muslim: "صحيح مسلم",
        },
        
        // AI Guide Section
        aiGuide: {
            title: "المرشد الروحي الذكي",
            placeholder: "كيف تشعر؟ صِف حالتك النفسية...",
            inputPlaceholder: "اكتب رسالتك هنا... (اضغط Enter للإرسال)",
            examplePrompts: "أمثلة على الأسئلة:",
            example1: "أشعر بالقلق بشأن المستقبل",
            example2: "أحتاج إلى إرشاد حول الصبر",
            example3: "ساعدني في إيجاد السكينة في الأوقات الصعبة",
            askButton: "احصل على الإرشاد",
            analyzing: "جاري تحليل مشاعرك...",
            response: "الرد",
            suggestedAyahs: "الآيات المقترحة",
            noResponse: "لا يوجد رد بعد",
        },
        
        // Favorites Section
        favorites: {
            title: "مفضلاتي",
            yourFavorites: "مفضلاتك",
            empty: "لا توجد مفضلات بعد",
            emptyDesc: "أضف آيات إلى مفضلاتك لرؤيتها هنا",
            analyze: "تحليل المفضلات",
            analyzing: "جاري تحليل مفضلاتك...",
            insights: "رؤى تحليلية",
            clear: "مسح الكل",
            confirmClear: "هل أنت متأكد من حذف جميع المفضلات؟",
            open: "فتح",
            remove: "إزالة",
            export: "تصدير",
        },
        
        // Hifdh Progress Section
        hifdh: {
            title: "تقدم الحفظ",
            totalProgress: "التقدم الكلي",
            surahs: "السور",
            ayahs: "الآيات",
            lastUpdated: "أخر تحديث",
            surahName: "اسم السورة",
            progress: "التقدم",
            completed: "مكتمل",
            memorize: "حفظ",
            review: "مراجعة",
            markComplete: "تحديد كمكتمل",
            markIncomplete: "تحديد كغير مكتمل",
            filter: "تصفية",
            all: "الكل",
            inProgress: "قيد التقدم",
            completedOnly: "المكتمل فقط",
            search: "البحث عن السور...",
            reset: "إعادة تعيين التقدم",
            quizGame: "لعبة الاختبار",
            quiz: "اختبار",
            listen: "استماع",
            markMemorized: "تحديد كمحفوظ",
            score: "النقاط",
            streak: "التسلسل",
            quizPrompt: "أكمل الآية - ما الذي يأتي بعد ذلك؟",
            prev: "السابق",
            next: "التالي",
            memorized: "تم الحفظ",
            play: "تشغيل",
            repeat: "إعادة",
            ayahOf: "الآية {current} من {total}",
            nextQuestion: "السؤال التالي",
            perfectKeepGoing: "ممتاز! استمر!",
            excellentMashallah: "ممتاز! ماشاء الله!",
            amazingGotIt: "رائع! أحسنت!",
            brilliantWellDone: "رائع! أحسن عمل!",
            notQuiteCorrect: "ليس تماماً! الإجابة الصحيحة مظللة أعلاه.",
        },
        
        // Options Page
        options: {
            title: "الإعدادات",
            subtitle: "تكوين إضافة سكينة",
            
            // New Tab Settings
            newTabSection: "تجربة التبويب الجديد",
            enableNewTab: "تفعيل صفحة سكينة للتبويب الجديد",
            newTabDesc: "استبدال صفحة التبويب الجديد في كروم بواجهة إسلامية هادئة",
            showAdhkar: "عرض وحدة الأذكار",
            showQuiz: "عرض وحدة الاختبار اليومي",
            ayahRotation: "تدوير الآيات",
            daily: "يومي",
            random: "عشوائي",
            fixed: "ثابت",
            
            // New Tab UI
            newtab: {
                subtitle: "بداية هادئة",
                customize: "تخصيص التبويب الجديد",
                enableSakinah: "تفعيل صفحة سكينة",
                disabledTitle: "سكينة في وضع الراحة",
                disabledDesc: "تجربة التبويب الجديد الإسلامية معطلة حالياً.",
                searchPlaceholder: "ابحث بسلام...",
                dailyQuiz: "اختبار اليوم",
                dailyAdhkar: "أذكار اليوم",
                favorites: "المفضلة",
                recentTabs: "علامات التبويب الأخيرة"
            },
            
            // Notification Settings
            notificationSection: "إعدادات الإشعارات",
            enableNotifications: "تفعيل الإشعارات",
            notificationType: "نوع الإشعار",
            intervalBased: "على فترات زمنية",
            customTimes: "أوقات مخصصة",
            both: "كلاهما",
            notificationInterval: "الفترة الزمنية للإشعارات",
            minutes: "دقيقة",
            customTimesLabel: "أوقات الإشعارات المخصصة",
            addTime: "إضافة وقت",
            removeTime: "إزالة",
            quietHours: "ساعات الهدوء",
            quietStart: "البداية",
            quietEnd: "النهاية",
            
            // Display Settings
            displaySection: "إعدادات العرض",
            showArabic: "عرض النص العربي",
            showTranslation: "عرض الترجمة الإنجليزية",
            showSurahInfo: "عرض معلومات السورة",
            fontSize: "حجم الخط",
            small: "صغير",
            medium: "متوسط",
            large: "كبير",
            
            // Recitation Settings
            recitationSection: "إعدادات التلاوة",
            reciter: "القارئ",
            
            // AI Guide Settings
            aiSection: "تفضيلات المرشد الذكي",
            aiAlwaysEnabled: "التحليل المتقدم بالذكاء الاصطناعي (Groq API) مفعّل دائماً لتحليل أفضل للمشاعر واقتراحات دقيقة للآيات.",
            detailedExplanations: "عرض شروحات تفصيلية",
            contextHistory: "تذكر سياق المحادثة",
            responseStyle: "أسلوب الرد",
            concise: "موجز",
            detailed: "تفصيلي",
            scholarly: "علمي",
            explanationLanguage: "لغة الشرح",
            english: "English (الإنجليزية)",
            arabic: "العربية",
            
            // Privacy Settings
            privacySection: "إعدادات الخصوصية",
            offlineMode: "الوضع غير المتصل (ذكاء اصطناعي محلي فقط)",
            anonymousUsage: "إحصائيات الاستخدام المجهولة",
            
            // Actions
            saveSettings: "حفظ الإعدادات",
            exportSettings: "تصدير الإعدادات",
            importSettings: "استيراد الإعدادات",
            resetSettings: "إعادة تعيين إلى الافتراضي",            showOnboarding: "عرض البداية",            settingsSaved: "تم حفظ الإعدادات بنجاح!",
            settingsReset: "تم إعادة تعيين الإعدادات إلى الافتراضي",
            
            // Language Settings
            languageSection: "إعدادات اللغة",
            interfaceLanguage: "لغة الواجهة",
            changeLanguage: "تغيير اللغة",
        },
        
        // Notification Popup
        notification: {
            title: "سكينة - آية اللحظة",
            openExtension: "فتح الإضافة",
        },
        
        // Common UI Elements
        common: {
            yes: "نعم",
            no: "لا",
            cancel: "إلغاء",
            confirm: "تأكيد",
            ok: "موافق",
            back: "رجوع",
            next: "التالي",
            previous: "السابق",
            save: "حفظ",
            stop: "إيقاف",
            delete: "حذف",
            edit: "تعديل",
            copy: "نسخ",
            share: "مشاركة",
            more: "المزيد",
            less: "أقل",
            to: "إلى",
            clear: "مسح المحادثة",
        },
        
        // Onboarding
        onboarding: {
            welcome: "مرحباً بك في سكينة",
            welcomeText: "رفيقك الروحي لإيجاد السكينة من خلال القرآن",
            feature1Title: "آيات عشوائية",
            feature1Desc: "استقبل آيات جميلة على مدار يومك",
            feature2Title: "المرشد الروحي الذكي",
            feature2Desc: "احصل على إرشاد شخصي بناءً على مشاعرك",
            feature4Title: "تجربة التبويب الجديد",
            feature4Desc: "واجهة إسلامية هادئة لاستخدامك اليومي للكمبيوتر",
            feature3Title: "تقدم الحفظ",
            feature3Desc: "تتبع رحلتك في حفظ القرآن",
            getStarted: "ابدأ الآن",
            chooseLanguage: "اختر لغتك",
            languageText: "اختر لغة الواجهة المفضلة لديك",
            language: "اللغة",
            chooseTimezone: "اختر منطقتك الزمنية",
            timezoneText: "هذا يساعدنا على إرسال الإشعارات في الوقت المناسب",
            detectedTimezone: "المنطقة الزمنية المكتشفة:",
            timezone: "المنطقة الزمنية",
            finish: "إنهاء الإعداد",
            preferences: "التفضيلات",
            preferencesText: "تخصيص تجربتك",
            aiResponseStyle: "أسلوب رد الذكاء الاصطناعي",
            explanationLanguage: "لغة الشرح",
            concise: "موجز",
            detailed: "تفصيلي",
            scholarly: "علمي",
            english: "الإنجليزية",
            arabic: "العربية",
        },
    },
};

// Translation utility class
class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.init();
    }
    
    async init() {
        // Load saved language preference
        const settings = await chrome.storage.sync.get({ interfaceLanguage: 'en' });
        this.currentLanguage = settings.interfaceLanguage;
        this.applyLanguage();
    }
    
    async setLanguage(lang) {
        this.currentLanguage = lang;
        await chrome.storage.sync.set({ interfaceLanguage: lang });
        this.applyLanguage();
    }
    
    get(key) {
        const keys = key.split('.');
        let value = TRANSLATIONS[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
        }
        
        return value;
    }
    
    applyLanguage() {
        // Set document direction for RTL
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Apply translations to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            // Check if we should update text content or placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });
        
        // Apply translations to elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.get(key);
        });
        
        // Apply translations to elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.get(key);
        });
        
        // Notify that language has changed
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLanguage } 
        }));
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    isRTL() {
        return this.currentLanguage === 'ar';
    }
}

// Create global translator instance
const translator = new TranslationManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRANSLATIONS, TranslationManager, translator };
}
