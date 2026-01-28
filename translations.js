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
        
        share: {
            title: "Share peace",
            button: "Share",
            shared_successfully: "Shared successfully!",
            copied_to_clipboard: "Copied to clipboard!",
            copy_text: "Copy Arabic & Translation",
            link_copied: "Extension link copied!",
            dailyAyah: "Daily Ayah",
            sunnahOfDay: "Sunnah of the day",
            duaaOfDay: "Duaa of the day",
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
                recentTabs: "Recent Tabs",
                prayerTimes: "Prayer Times",
                dailyDeeds: "Daily Deeds",
                sunnahOfDay: "Sunnah of the Day",
                gratitudeJournal: "Gratitude Journal",
                duaaOfDay: "Duaa of the Day",
                adhkarHadith: "Adhkar & Hadith",
                quiz: "Quiz",
                bookmarksBar: "Bookmarks Bar",
                otherBookmarks: "Other Bookmarks",
                searchBookmarks: "Search bookmarks...",
                clearAll: "Clear All",
                gratitudePlaceholder: "What are you grateful for today? (Alhamdulillah for...)",
                history: "History",
                saveEntry: "Save Entry",
                saved: "Saved! ✨",
                loadingDeeds: "Loading deeds...",
                noActivity: "No recent activity found.",
                noHistory: "No entries yet. Start writing today!",
                bookmarksPermission: "Bookmarks permission required",
                confirmClearRecent: "Are you sure you want to clear all recent tabs?",
                generatingInsight: "Generating spiritual insight...",
                errorAI: "An error occurred during analysis.",
                aiGuideTitle: "Sakinah Guide",
                aiWelcome: "Assalamu Alaikum! I'm Sakinah, your spiritual guide. How can I help you find peace today?",
                explainHadith: "Explain Hadith",
                refreshContent: "Refresh Content",
                customizeWallpaper: "Customize Wallpaper",
                refreshWallpaper: "Refresh Wallpaper",
                gratitudeHistory: "Gratitude History",
                downloadJournal: "Download Journal (.txt)",
                imageUrl: "Image URL",
                or: "— OR —",
                uploadDevice: "Upload from device",
            },

        // Notification Sections
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

    ecosystems: {
        google: "Google",
        microsoft: "Microsoft",
        apple: "Apple",
        apps: "{name} Apps",
        gmail: "Gmail",
        images: "Images",
        outlook: "Outlook",
        office: "Office",
        mail: "Mail",
        photos: "Photos"
    },

    prayers: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
    },

    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    defaultDeeds: [
        "5 Daily Prayers",
        "Read Quran",
        "Morning/Evening Adhkar",
        "Act of Kindness",
        "Give Charity"
    ],

    sunnahs: [
        { 
            arabic: 'السواك عند كل صلاة',
            title: 'Using the Siwak', 
            description: 'Using the Siwak before every Salah to maintain purity.' 
        },
        { 
            arabic: 'التبسم في وجه أخيك',
            title: 'Smiling', 
            description: 'Smiling at others is a form of charity (Sadaqah).' 
        },
        { 
            arabic: 'النوم على الشق الأيمن',
            title: 'Sleeping on the Right', 
            description: 'Sleeping on your right side following the prophetic tradition.' 
        },
        { 
            arabic: 'التسمية عند دخول البيت',
            title: 'Bismillah upon Entering', 
            description: 'Saying Bismillah when entering your home for barakah.' 
        },
        { 
            arabic: 'الوضوء قبل النوم',
            title: 'Wudu before Sleep', 
            description: 'Performing Wudu before going to bed to stay in a state of purity.' 
        },
        { 
            arabic: 'الشرب جالساً',
            title: 'Drinking while Sitting', 
            description: 'Drinking water while sitting and in three breaths.' 
        },
        { 
            arabic: 'البدء باليمين',
            title: 'Starting with the Right', 
            description: 'Always starting with the right side when dressing or entering the Masjid.' 
        },
        { 
            arabic: 'إفشاء السلام',
            title: 'Spreading Salaam', 
            description: 'Offering Salaam to those you know and those you do not know.' 
        },
        { 
            arabic: 'إماطة الأذى عن الطريق',
            title: 'Removing Harm', 
            description: 'Removing a harmful object from the path is a branch of faith.' 
        },
        { 
            arabic: 'التسميت عند العطاس',
            title: 'Sneezing Etiquette', 
            description: 'Saying Alhamdulillah after sneezing and following the sunnah responses.' 
        },
        { 
            arabic: 'الأذكار بعد الصلاة',
            title: 'Dhikr after Salah', 
            description: 'Reciting Tasbih, Tahmid and Takbir 33 times each after every obligatory prayer.' 
        },
        { 
            arabic: 'ركعتا الفجر',
            title: 'The Two Rak\'ahs of Fajr', 
            description: 'Observing the two Sunnah rak\'ahs before the Fajr prayer, for their immense reward.' 
        },
        { 
            arabic: 'الأكل باليمين',
            title: 'Eating with the Right Hand', 
            description: 'Using the right hand for eating and drinking as taught by the Prophet.' 
        },
        { 
            arabic: 'قراءة آية الكرسي قبل النوم',
            title: 'Ayat al-Kursi before Sleep', 
            description: 'Reciting Ayat al-Kursi before going to bed for divine protection during the night.' 
        },
        { 
            arabic: 'صيام الاثنين والخميس',
            title: 'Fasting Mondays & Thursdays', 
            description: 'Fasting on these two days of the week as it was the regular practice of the Prophet ﷺ.' 
        },
        { 
            arabic: 'عيادة المريض',
            title: 'Visiting the Sick', 
            description: 'Spending time to visit and comfort a Muslim who is ill, following the Sunnah.' 
        },
        { 
            arabic: 'استخدام اليد اليمنى في الأمور الطيبة',
            title: 'Using Right Hand for Good', 
            description: 'Using the right hand for giving, taking, shaking hands and other noble actions.' 
        },
        { 
            arabic: 'التسمية قبل الأكل',
            title: 'Bismillah before Eating', 
            description: 'Starting your meal with Bismillah to bring barakah to your food.' 
        },
        { 
            arabic: 'قراءة سورة الكهف يوم الجمعة',
            title: 'Surah Al-Kahf on Friday', 
            description: 'Reading Surah Al-Kahf on Fridays for spiritual light that lasts until the following Friday.' 
        },
        { 
            arabic: 'كثرة الاستغفار',
            title: 'Seeking Forgiveness', 
            description: 'Frequently seeking Allah\'s forgiveness through Istighfar throughout the day.' 
        },
        { 
            arabic: 'تحية المسجد',
            title: 'Tahiyatul Masjid', 
            description: 'Offering two rak\'ahs of prayer as a greeting upon entering the Masjid.' 
        },
        { 
            arabic: 'صلاة الاستخارة',
            title: 'Istikhara Prayer', 
            description: 'Seeking Allah\'s guidance for important life decisions through a special prayer.' 
        },
        { 
            arabic: 'قراءة سورة الملك',
            title: 'Reading Surah Al-Mulk', 
            description: 'Reciting Surah Al-Mulk every night to seek protection from the grave\'s punishment.' 
        },
        { 
            arabic: 'نفض الفراش',
            title: 'Dusting the Bed', 
            description: 'Dusting off the bed three times before lying down to sleep.' 
        },
        { 
            arabic: 'عدم الإسراف في الماء',
            title: 'Saving Water', 
            description: 'Being mindful not to waste water, even when performing Wudu from a running stream.' 
        },
        { 
            arabic: 'السلام على الصبيان',
            title: 'Greeting Children', 
            description: 'Offering Salaam to children to teach them and follow the Prophet\'s humility.' 
        },
        { 
            arabic: 'ركعتا سنة الوضوء',
            title: 'Prayer after Wudu', 
            description: 'Observing two rak\'ahs of prayer after completing Wudu (Shukr al-Wudu).' 
        },
        { 
            arabic: 'المشي إلى المسجد',
            title: 'Walking to the Masjid', 
            description: 'Walking to the prayer, where every step raises a degree and removes a sin.' 
        },
        { 
            arabic: 'المصافحة عند اللقاء',
            title: 'Shaking Hands', 
            description: 'Shaking hands when meeting other Muslims to have sins forgiven.' 
        },
        { 
            arabic: 'تهادوا تحابوا',
            title: 'Exchanging Gifts', 
            description: 'Exchanging gifts with one another to increase mutual love and affection.' 
        }
    ],
    
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
            welcomeText: "A calm beginning to your digital day. Find peace through daily verses and spiritual guidance.",
            feature1Title: "Daily Verses",
            feature1Desc: "Start every new tab with a beautiful Quranic ayah",
            feature2Title: "Sakinah Guide",
            feature2Desc: "AI-powered spiritual wisdom for your daily challenges",
            feature3Title: "New Tab Experience",
            feature3Desc: "A calm Islamic interface for your daily computer use",
            getStarted: "Get Started",
            aboutTitle: "How Sakinah Works",
            aboutSubtitle: "Sakinah is built with your peace and privacy as the core principles.",
            privacyTitle: "Built-in Privacy",
            privacyDesc: "Your data never leaves your device. No tracking, no external servers for your personal settings.",
            experienceTitle: "Morning & Evening",
            experienceDesc: "The interface adapts to the time of day, offering specific Adhkar and Ayahs for your current moment.",
            personalize: "Personalize",
            chooseLanguage: "Choose Your Language",
            languageText: "Select your preferred interface language",
            language: "Interface Language",
            chooseTimezone: "Choose Your Timezone",
            timezoneText: "This helps us send notifications at the right time",
            detectedTimezone: "Detected Timezone:",
            timezone: "Timezone",
            finish: "Finish Setup",
            preferences: "Preferences",
            preferencesText: "Customize your experience",
            aiGuide: "Sakinah Guide",
            aiResponseStyle: "Response Style",
            explanationLanguage: "Explanation Language",
            concise: "Concise & Direct",
            detailed: "Empathetic & Detailed",
            scholarly: "Scholarly & Reflective",
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
        
        share: {
            title: "شارك السلام",
            button: "مشاركة",
            shared_successfully: "تمت المشاركة بنجاح!",
            copied_to_clipboard: "تم النسخ إلى الحافظة!",
            copy_text: "نسخ الآية والترجمة",
            link_copied: "تم نسخ رابط الإضافة!",
            dailyAyah: "آية اليوم",
            sunnahOfDay: "سنة اليوم",
            duaaOfDay: "دعاء اليوم",
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
                recentTabs: "علامات التبويب الأخيرة",
                prayerTimes: "مواقيت الصلاة",
                dailyDeeds: "أعمال اليوم",
                sunnahOfDay: "سنة اليوم",
                gratitudeJournal: "مذكرات الامتنان",
                duaaOfDay: "دعاء اليوم",
                adhkarHadith: "الأذكار والأحاديث",
                quiz: "اختبار",
                bookmarksBar: "شريط الإشارات",
                otherBookmarks: "إشارات أخرى",
                searchBookmarks: "البحث في الإشارات...",
                clearAll: "مسح الكل",
                gratitudePlaceholder: "ما الذي تمتن له اليوم؟ (الحمد لله على...)",
                history: "السجل",
                saveEntry: "حفظ",
                saved: "تم الحفظ! ✨",
                loadingDeeds: "جاري تحميل الأعمال...",
                noActivity: "لم يتم العثور على نشاط مؤخراً.",
                noHistory: "لا توجد مدخلات بعد. ابدأ الكتابة اليوم!",
                bookmarksPermission: "مطلوب إذن الوصول إلى الإشارات المرجعية",
                confirmClearRecent: "هل أنت متأكد من مسح جميع علامات التبويب الأخيرة؟",
                generatingInsight: "جاري توليد رؤية روحية...",
                errorAI: "حدث خطأ أثناء التحليل.",
                aiGuideTitle: "مرشد سكينة",
                aiWelcome: "السلام عليكم! أنا سكينة، مرشدك الروحي. كيف يمكنني مساعدتك في العثور على السلام اليوم؟",
                explainHadith: "شرح الحديث",
                refreshContent: "تحديث المحتوى",
                customizeWallpaper: "تخصيص الخلفية",
                refreshWallpaper: "تحديث الخلفية",
                gratitudeHistory: "سجل الامتنان",
                downloadJournal: "تحميل المذكرات (ملف نصي)",
                imageUrl: "رابط الصورة",
                or: "— أو —",
                uploadDevice: "رفع من الجهاز",
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
        resetSettings: "إعادة تعيين إلى الافتراضي",
        showOnboarding: "عرض البداية",
        settingsSaved: "تم حفظ الإعدادات بنجاح!",
        settingsReset: "تم إعادة تعيين الإعدادات إلى الافتراضي",
        
        // Language Settings
        languageSection: "إعدادات اللغة",
        interfaceLanguage: "لغة الواجهة",
        changeLanguage: "تغيير اللغة",
    },

    ecosystems: {
        google: "جوجل",
        microsoft: "مايكروسوفت",
        apple: "أبل",
        apps: "تطبيقات {name}",
        gmail: "جي ميل",
        images: "صور",
        outlook: "أوتلوك",
        office: "أوفيس",
        mail: "البريد",
        photos: "الصور"
    },

    prayers: {
        fajr: "الفجر",
        sunrise: "الشروق",
        dhuhr: "الظهر",
        asr: "العصر",
        maghrib: "المغرب",
        isha: "العشاء"
    },

    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],

    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],

    defaultDeeds: [
        "الصلوات الخمس",
        "قراءة القرآن",
        "أذكار الصباح والمساء",
        "فعل خير",
        "تصدق"
    ],

    sunnahs: [
        { 
            arabic: 'السواك عند كل صلاة',
            title: 'استخدام السواك', 
            description: 'استخدام السواك قبل كل صلاة للحفاظ على طهارة الفم.' 
        },
        { 
            arabic: 'التبسم في وجه أخيك',
            title: 'التبسم', 
            description: 'التبسم في وجه الآخرين صدقة تؤجر عليها.' 
        },
        { 
            arabic: 'النوم على الشق الأيمن',
            title: 'النوم على الجانب الأيمن', 
            description: 'النوم على الجانب الأيمن اتباعاً للسنة النبوية الشريفة.' 
        },
        { 
            arabic: 'التسمية عند دخول البيت',
            title: 'البسملة عند الدخول', 
            description: 'قول بسم الله عند دخول المنزل لجلب البركة وطرد الشيطان.' 
        },
        { 
            arabic: 'الوضوء قبل النوم',
            title: 'الوضوء قبل النوم', 
            description: 'الوضوء قبل الذهاب إلى الفراش للبقاء على طهارة طوال الليل.' 
        },
        { 
            arabic: 'الشرب جالساً',
            title: 'الشرب جالساً', 
            description: 'شرب الماء جالساً وعلى ثلاث دفعات كما كان يفعل النبي ﷺ.' 
        },
        { 
            arabic: 'البدء باليمين',
            title: 'البدء باليمين', 
            description: 'البدء دائماً بالجانب الأيمن عند اللبس أو دخول المسجد أو العمل.' 
        },
        { 
            arabic: 'إفشاء السلام',
            title: 'إفشاء السلام', 
            description: 'إلقاء السلام على من تعرف ومن لا تعرف لنشر المحبة.' 
        },
        { 
            arabic: 'إماطة الأذى عن الطريق',
            title: 'إماطة الأذى', 
            description: 'إزالة الأذى عن الطريق شعبة من شعب الإيمان.' 
        },
        { 
            arabic: 'التسميت عند العطاس',
            title: 'آداب العطاس', 
            description: 'قول الحمد لله بعد العطاس واتباع هدي النبي ﷺ في الرد.' 
        },
        { 
            arabic: 'الأذكار بعد الصلاة',
            title: 'الأذكار بعد الصلاة', 
            description: 'المداومة على أذكار ما بعد الصلاة (التسبيح والتحميد والتكبير).' 
        },
        { 
            arabic: 'ركعتا الفجر',
            title: 'سنة الفجر القبلية', 
            description: 'صلاة ركعتين قبل صلاة الفجر، وهما خير من الدنيا وما فيها.' 
        },
        { 
            arabic: 'الأكل باليمين',
            title: 'الأكل باليد اليمنى', 
            description: 'استخدام اليد اليمنى في الأكل والشرب اتباعاً لهدي النبي ﷺ.' 
        },
        { 
            arabic: 'قراءة آية الكرسي قبل النوم',
            title: 'آية الكرسي قبل النوم', 
            description: 'قراءة آية الكرسي عند النوم للحفظ من الشيطان حتى يصبح.' 
        },
        { 
            arabic: 'صيام الاثنين والخميس',
            title: 'صيام الاثنين والخميس', 
            description: 'الحرص على صيام يومي الاثنين والخميس من كل أسبوع.' 
        },
        { 
            arabic: 'عيادة المريض',
            title: 'زيارة المريض', 
            description: 'زيارة المرضى والدعاء لهم بالشفاء وتخفيف آلامهم.' 
        },
        { 
            arabic: 'استخدام اليد اليمنى في الأمور الطيبة',
            title: 'التيمن في الأمور الطيبة', 
            description: 'تفضيل اليد اليمنى في العطاء والأخذ والمصافحة وشؤون الخير.' 
        },
        { 
            arabic: 'التسمية قبل الأكل',
            title: 'التسمية قبل الطعام', 
            description: 'قول (بسم الله) قبل البدء بالأكل لجلب البركة في الطعام.' 
        },
        { 
            arabic: 'قراءة سورة الكهف يوم الجمعة',
            title: 'سورة الكهف يوم الجمعة', 
            description: 'قراءة سورة الكهف في يوم الجمعة لتنور للمسلم ما بين الجمعتين.' 
        },
        { 
            arabic: 'كثرة الاستغفار',
            title: 'ملازمة الاستغفار', 
            description: 'الإكثار من قول (أستغفر الله) في جميع الأوقات لطلب المغفرة.' 
        },
        { 
            arabic: 'تحية المسجد',
            title: 'تحية المسجد', 
            description: 'صلاة ركعتين عند دخول المسجد قبل الجلوس.' 
        },
        { 
            arabic: 'صلاة الاستخارة',
            title: 'صلاة الاستخارة', 
            description: 'طلب الخيرة من الله تعالى في الأمور الهامة من خلال صلاة الاستخارة.' 
        },
        { 
            arabic: 'قراءة سورة الملك',
            title: 'قراءة سورة الملك', 
            description: 'المداومة على قراءة سورة الملك كل ليلة قبل النوم للمنجاة من عذاب القبر.' 
        },
        { 
            arabic: 'نفض الفراش',
            title: 'نفض الفراش', 
            description: 'نفض الفراش ثلاث مرات قبل الاستلقاء للنوم اتباعاً للسنة.' 
        },
        { 
            arabic: 'عدم الإسراف في الماء',
            title: 'عدم الإسراف في الماء', 
            description: 'الاقتصاد في استخدام الماء حتى لو كان المسلم يتوضأ من نهر جارٍ.' 
        },
        { 
            arabic: 'السلام على الصبيان',
            title: 'السلام على الصبيان', 
            description: 'إلقاء السلام على الأطفال لتعليمهم وتواضعاً كما فعل النبي ﷺ.' 
        },
        { 
            arabic: 'ركعتا سنة الوضوء',
            title: 'ركعتا سنة الوضوء', 
            description: 'صلاة ركعتين نافلة بعد الفراغ من الوضوء مباشرة.' 
        },
        { 
            arabic: 'المشي إلى المسجد',
            title: 'المشي إلى المسجد', 
            description: 'السير إلى الصلاة حيث تكتب بكل خطوة حسنة وتمحى بها سيئة.' 
        },
        { 
            arabic: 'المصافحة عند اللقاء',
            title: 'المصافحة عند اللقاء', 
            description: 'مصافحة المسلم لأخيه عند اللقاء لتساقط الذنوب من بين أصابعهما.' 
        },
        { 
            arabic: 'تهادوا تحابوا',
            title: 'تبادل الهدايا', 
            description: 'تبادل الهدايا بين الناس لنشر المحبة وتأليف القلوب.' 
        }
    ],
    
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
            welcomeText: "بداية هادئة ليومك الرقمي. اعثر على السكينة من خلال الآيات اليومية والإرشاد الروحي.",
            feature1Title: "آيات يومية",
            feature1Desc: "ابدأ كل تبويب جديد بآية قرآنية كريمة",
            feature2Title: "مرشد سكينة",
            feature2Desc: "حكمة روحية مدعومة بالذكاء الاصطناعي لتحدياتك اليومية",
            feature3Title: "تجربة التبويب الجديد",
            feature3Desc: "واجهة إسلامية هادئة لاستخدامك اليومي للكمبيوتر",
            getStarted: "ابدأ الآن",
            aboutTitle: "كيف تعمل سكينة",
            aboutSubtitle: "تم بناء سكينة مع وضع خصوصيتك وطمأنينتك كمبادئ أساسية.",
            privacyTitle: "خصوصية مدمجة",
            privacyDesc: "بياناتك لا تغادر جهازك أبداً. لا تتبع، ولا خوادم خارجية لإعداداتك الشخصية.",
            experienceTitle: "صباحاً ومساءً",
            experienceDesc: "تتكيف الواجهة مع وقت اليوم، وتقدم أذكاراً وآيات محددة للحظتك الحالية.",
            personalize: "تخصيص",
            chooseLanguage: "اختر لغتك",
            languageText: "اختر لغة الواجهة المفضلة لديك",
            language: "لغة الواجهة",
            chooseTimezone: "اختر منطقتك الزمنية",
            timezoneText: "هذا يساعدنا على إرسال الإشعارات في الوقت المناسب",
            detectedTimezone: "المنطقة الزمنية المكتشفة:",
            timezone: "المنطقة الزمنية",
            finish: "إنهاء الإعداد",
            preferences: "التفضيلات",
            preferencesText: "تخصيص تجربتك",
            aiGuide: "مرشد سكينة",
            aiResponseStyle: "أسلوب الرد",
            explanationLanguage: "لغة الشرح",
            concise: "موجز ومباشر",
            detailed: "متعاطف وتفصيلي",
            scholarly: "علمي وتأملي",
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
        const settings = await chrome.storage.sync.get({ language: 'en' });
        this.currentLanguage = settings.language;
        this.applyLanguage();
    }
    
    async setLanguage(lang) {
        this.currentLanguage = lang;
        await chrome.storage.sync.set({ language: lang });
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
window.translator = translator;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRANSLATIONS, TranslationManager, translator };
}
