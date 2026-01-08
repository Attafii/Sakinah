// Onboarding script for Sakinah extension

window.currentStep = 1;
window.totalSteps = 5;

/**
 * Navigation: Move to next step
 */
window.nextStep = function() {
    if (window.currentStep < window.totalSteps) {
        const currentStepEl = document.getElementById(`step${window.currentStep}`);
        const nextStepEl = document.getElementById(`step${window.currentStep + 1}`);
        
        if (currentStepEl && nextStepEl) {
            currentStepEl.classList.remove('active');
            window.currentStep++;
            nextStepEl.classList.add('active');
            window.scrollTo(0, 0);
        }
    }
}

/**
 * Navigation: Move to previous step
 */
window.prevStep = function() {
    if (window.currentStep > 1) {
        const currentStepEl = document.getElementById(`step${window.currentStep}`);
        const prevStepEl = document.getElementById(`step${window.currentStep - 1}`);
        
        if (currentStepEl && prevStepEl) {
            currentStepEl.classList.remove('active');
            window.currentStep--;
            prevStepEl.classList.add('active');
            window.scrollTo(0, 0);
        }
    }
}

/**
 * Handle Language selection change
 */
window.handleLanguageChange = async function() {
    console.log('Language change triggered');
    try {
        const languageSelection = document.getElementById('language-select').value;
        const t = window.translator;
        
        if (t && t.setLanguage) {
            await t.setLanguage(languageSelection);
        }
        
        // Update document direction
        document.documentElement.dir = languageSelection === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = languageSelection;
        
        // Sync explanation language for coherence
        const expLangSelect = document.getElementById('explanation-language');
        if (expLangSelect) {
            expLangSelect.value = languageSelection === 'ar' ? 'arabic' : 'english';
        }

        // Re-translate page
        if (t && t.applyLanguage) {
            t.applyLanguage();
        }
    } catch (error) {
        console.error('Error changing language:', error);
    }
}

/**
 * Finalize onboarding process
 */
window.finishOnboarding = async function() {
    console.log('Finish onboarding triggered');
    try {
        const languageVal = document.getElementById('language-select').value;
        const cityVal = document.getElementById('city-input').value.trim() || 'London';
        const countryVal = document.getElementById('country-input').value.trim() || 'GB';
        const aiResponseStyleVal = document.getElementById('ai-response-style').value;
        const explanationLanguageVal = document.getElementById('explanation-language').value;
        
        // Use CONFIG.DEFAULT_SETTINGS as base (requires config.js to be loaded)
        const settings = (typeof CONFIG !== 'undefined' && CONFIG.DEFAULT_SETTINGS) ? 
            JSON.parse(JSON.stringify(CONFIG.DEFAULT_SETTINGS)) : {};
        
        // Apply user choices
        settings.language = languageVal;
        settings.location = { city: cityVal, country: countryVal };
        settings.aiResponseStyle = aiResponseStyleVal;
        settings.explanationLanguage = explanationLanguageVal;
        settings.onboardingCompleted = true;

        console.log('Saving settings:', settings);
        const optionalPermissions = ['bookmarks', 'sessions', 'topSites', 'history', 'notifications'];
        
        try {
            await new Promise((resolve) => {
                chrome.permissions.request({ permissions: optionalPermissions }, (granted) => {
                    console.log('Permissions granted:', granted);
                    resolve(granted);
                });
            });
        } catch (pErr) {
            console.warn('Permission request failed or dismissed', pErr);
        }
        
        // Save merged settings
        await chrome.storage.sync.set({ settings });
        
        // Open the dashboard
        window.location.href = 'newtab.html';
    } catch (error) {
        console.error('Error finishing onboarding:', error);
        // Fallback: try to redirect anyway
        window.location.href = 'newtab.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Onboarding script initializing...');
    
    // Attach event listeners (Required for MV3 CSP)
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.addEventListener('click', window.nextStep);

    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) finishBtn.addEventListener('click', window.finishOnboarding);

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', window.nextStep);
    });

    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', window.prevStep);
    });

    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', window.handleLanguageChange);
    }

    try {
        // Use the global translator instance from translations.js
        if (typeof window.translator !== 'undefined' && window.translator.init) {
            await window.translator.init();
        }
        
        const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
        if (langSelect) {
            langSelect.value = browserLang;
            // Apply layout direction immediately
            document.documentElement.dir = browserLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = browserLang;
        }

        if (typeof window.translator !== 'undefined' && window.translator.applyLanguage) {
            window.translator.applyLanguage();
        }
    } catch (error) {
        console.error('Onboarding init error:', error);
    }
});
