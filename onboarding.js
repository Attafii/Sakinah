// Onboarding script for Sakinah extension

let currentStep = 1;
const totalSteps = 3;
let translator;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize translator
    translator = new TranslationManager();
    await translator.init();
    
    // Load saved language if any
    const { interfaceLanguage } = await chrome.storage.sync.get({ interfaceLanguage: 'en' });
    document.getElementById('language-select').value = interfaceLanguage;
    translator.setLanguage(interfaceLanguage);
    
    // Populate timezone dropdown
    populateTimezones();
    
    // Detect and display current timezone
    detectTimezone();
});

function nextStep() {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

async function handleLanguageChange() {
    const language = document.getElementById('language-select').value;
    translator.setLanguage(language);
    
    // Save language preference
    await chrome.storage.sync.set({ interfaceLanguage: language });
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
    const timezone = document.getElementById('timezone-select').value;
    const language = document.getElementById('language-select').value;
    
    // Save settings
    await chrome.storage.sync.set({
        timezone: timezone,
        interfaceLanguage: language,
        onboardingCompleted: true,
        notificationsEnabled: true,
        notificationInterval: 60,
        showArabic: true,
        showTranslation: true
    });
    
    // Close onboarding and open extension popup
    chrome.tabs.create({ url: 'popup.html' });
    window.close();
}
