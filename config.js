// config.js - Configuration file
// Note: This file contains only the proxy URL, not sensitive API keys

const CONFIG = {
    PROXY_URL: 'https://sakinah-ai-proxy.attafiahmed-dev.workers.dev',
    CALENDAR_API_KEY: '',
    WORKER_URL: 'https://sakinah-ai-proxy.attafiahmed-dev.workers.dev',
    DEFAULT_SETTINGS: {
        newTabEnabled: true,
        language: 'en',
        primaryEcosystem: 'google',
        theme: 'auto',
        arabicFont: 'font-uthmani',
        fontSize: 'medium',
        reciter: 'ar.alafasy',
        showAdhkar: true,
        showQuiz: true,
        ayahRotation: 'daily',
        prayerCity: 'London',
        prayerCountry: 'GB',
        prayerMethod: '3',
        notificationsEnabled: true,
        notificationType: 'interval',
        notificationInterval: 60,
        notificationCustomTimes: [],
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        aiDetailedExplanations: true,
        aiResponseStyle: 'detailed',
        explanationLanguage: 'english',
        offlineMode: false,
        onboardingCompleted: false,
        deeds: [
            "5 Daily Prayers",
            "Read Quran",
            "Morning/Evening Adhkar",
            "Act of Kindness",
            "Give Charity"
        ]
    }
};
