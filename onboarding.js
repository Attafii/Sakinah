// Onboarding script for Sakinah extension

let currentStep = 1;
const totalSteps = 4;
let translator;

// Function declarations (hoisted, so they're available immediately)
function nextStep() {
    console.log('nextStep called, currentStep:', currentStep);
    try {
        if (currentStep < totalSteps) {
            const currentStepEl = document.getElementById(`step${currentStep}`);
            const nextStepEl = document.getElementById(`step${currentStep + 1}`);
            
            console.log('Current step element:', currentStepEl);
            console.log('Next step element:', nextStepEl);
            
            if (currentStepEl && nextStepEl) {
                currentStepEl.classList.remove('active');
                currentStep++;
                nextStepEl.classList.add('active');
                
                // Re-initialize icons for the new step
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    } catch (error) {
        console.error('Error in nextStep:', error);
    }
}

function prevStep() {
    console.log('prevStep called, currentStep:', currentStep);
    try {
        if (currentStep > 1) {
            const currentStepEl = document.getElementById(`step${currentStep}`);
            const prevStepEl = document.getElementById(`step${currentStep - 1}`);
            
            if (currentStepEl && prevStepEl) {
                currentStepEl.classList.remove('active');
                currentStep--;
                prevStepEl.classList.add('active');
                
                // Re-initialize icons for the new step
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    } catch (error) {
        console.error('Error in prevStep:', error);
    }
}

async function handleLanguageChange() {
    try {
        const language = document.getElementById('language-select').value;
        if (translator) {
            await translator.setLanguage(language);
        }
        
        // Save language preference
        await chrome.storage.sync.set({ interfaceLanguage: language });
        
        // Re-initialize icons in case direction changed
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error in handleLanguageChange:', error);
    }
}

function populateTimezones() {
    const timezones = [
        'Africa/Cairo',
        'Africa/Casablanca',
        'Africa/Johannesburg',
        'Africa/Lagos',
        'America/Chicago',
        'America/Los_Angeles',
        'America/New_York',
        'America/Toronto',
        'Asia/Baghdad',
        'Asia/Beirut',
        'Asia/Damascus',
        'Asia/Dubai',
        'Asia/Istanbul',
        'Asia/Jakarta',
        'Asia/Jerusalem',
        'Asia/Karachi',
        'Asia/Kolkata',
        'Asia/Kuala_Lumpur',
        'Asia/Kuwait',
        'Asia/Manila',
        'Asia/Riyadh',
        'Asia/Shanghai',
        'Asia/Singapore',
        'Asia/Tehran',
        'Asia/Tokyo',
        'Australia/Sydney',
        'Europe/Berlin',
        'Europe/London',
        'Europe/Moscow',
        'Europe/Paris',
        'Europe/Rome',
        'Pacific/Auckland',
    ];
    
    const select = document.getElementById('timezone-select');
    
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

function detectTimezone() {
    try {
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        document.getElementById('detected-timezone').textContent = detectedTz.replace(/_/g, ' ');
        
        // Set the detected timezone as default
        const select = document.getElementById('timezone-select');
        if (select.querySelector(`option[value="${detectedTz}"]`)) {
            select.value = detectedTz;
        }
    } catch (error) {
        console.error('Error detecting timezone:', error);
        document.getElementById('detected-timezone').textContent = 'Unable to detect';
    }
}

async function finishOnboarding() {
    try {
        const timezone = document.getElementById('timezone-select').value;
        const language = document.getElementById('language-select').value;
        const aiResponseStyle = document.getElementById('ai-response-style').value;
        const explanationLanguage = document.getElementById('explanation-language').value;
        
        // Start with default settings
        const settings = { ...CONFIG.DEFAULT_SETTINGS };
        
        // Override with onboarding choices
        settings.timezone = timezone;
        settings.interfaceLanguage = language;
        settings.aiResponseStyle = aiResponseStyle;
        settings.explanationLanguage = explanationLanguage;
        settings.onboardingCompleted = true;
        
        // Save settings
        await chrome.storage.sync.set(settings);
        
        // Close onboarding and open extension popup
        chrome.tabs.create({ url: 'popup.html' });
        window.close();
    } catch (error) {
        console.error('Error in finishOnboarding:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Onboarding page loaded');
        
        // Initialize icons
        if (typeof lucide !== 'undefined') {
            console.log('Lucide loaded, creating icons');
            lucide.createIcons();
        } else {
            console.warn('Lucide not loaded');
        }

        // Initialize translator
        console.log('Initializing translator');
        translator = new TranslationManager();
        await translator.init();
        
        // Load saved language if any
        const storage = await chrome.storage.sync.get({ interfaceLanguage: 'en' });
        const interfaceLanguage = storage.interfaceLanguage || 'en';
        console.log('Language:', interfaceLanguage);
        
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = interfaceLanguage;
        }
        
        if (translator) {
            await translator.setLanguage(interfaceLanguage);
        }
        
        // Populate timezone dropdown
        populateTimezones();
        
        // Detect and display current timezone
        detectTimezone();
        
        console.log('Onboarding initialization complete');
    } catch (error) {
        console.error('Error initializing onboarding:', error);
        // Continue anyway so the buttons still work
    }
});
