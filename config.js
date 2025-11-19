// config.js - Configuration loader for API keys
// Note: In Chrome extensions, we can't use process.env directly
// This file should be populated during build or manually before loading
// Copy .env.example to .env and this will be replaced at build time

const CONFIG = {
    GROQ_API_KEY: 'GROQ_API_KEY'
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
