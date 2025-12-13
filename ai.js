// ai.js - Fully AI-powered Guide using Groq API

class AIGuide {
    constructor() {
        // Use proxy server instead of direct Groq API
        this.proxyEndpoint = CONFIG.PROXY_URL;
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Keep last 10 messages for context
    }

    // Main function to get AI guidance based on user input
    async getGuidance(userInput, ayahDatabase, options = {}) {
        try {
            const forceArabic = options.forceArabic || false;

            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userInput
            });

            // Trim history if too long
            if (this.conversationHistory.length > this.maxHistoryLength) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
            }

            const result = await this.callGroqAPI(userInput, ayahDatabase, forceArabic);
            
            if (result.success) {
                // Add assistant response to history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: result.response
                });
            }

            return result;

        } catch (error) {
            console.error('Error in AI Guide:', error);
            return {
                success: false,
                error: 'api_error',
                message: 'An error occurred while getting guidance. Please try again.'
            };
        }
    }

    // Call Groq API for guidance
    async callGroqAPI(userInput, ayahDatabase, forceArabic = false) {
        try {
            // Build context from ayah database
            const ayahContext = this.buildAyahContext(ayahDatabase);
            
            const languageInstruction = forceArabic 
                ? `1. You MUST respond ENTIRELY in Arabic (العربية الفصحى). Even if the user writes in English or any other language, YOUR RESPONSE MUST BE IN ARABIC ONLY. Use formal Arabic script.
2. عند الكتابة بالعربية، استخدم فقط الحروف العربية. لا تخلط اللغات أبداً.`
                : `1. You MUST respond in the SAME LANGUAGE the user writes in. If they write in Arabic, respond fully in Arabic. If they write in English, respond in English. If they write in French, respond in French, etc.
2. When responding in Arabic, use ONLY Arabic script. Never mix languages.`;

            const systemPrompt = `You are Sakinah, a compassionate and knowledgeable Islamic spiritual guide. Your purpose is to help Muslims find peace, guidance, and relevant Quranic verses for their emotional and spiritual states.

CRITICAL INSTRUCTIONS:
${languageInstruction}
3. Be warm, empathetic, and non-judgmental.
4. Base your guidance on authentic Islamic teachings.
5. When suggesting a Quranic verse, provide:
   - The verse reference (Surah:Ayah)
   - The Arabic text if available
   - A brief translation${forceArabic ? ' (in Arabic)' : ''}
   - Why this verse is relevant to the user's situation
6. You can have a natural conversation - remember context from previous messages.
7. If the user shares something difficult, acknowledge their feelings first before providing guidance.
8. Be concise but meaningful. Aim for 2-4 paragraphs unless more detail is needed.
9. Always end with an encouraging word or a brief dua (supplication).

AVAILABLE QURAN VERSES FOR REFERENCE (you can suggest verses from this list or mention others you know):
${ayahContext}

Remember: Your goal is to bring sakinah (tranquility) to the user's heart through the Quran and Islamic wisdom.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                ...this.conversationHistory
            ];

            const response = await fetch(this.proxyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.7,
                    max_completion_tokens: 1500
                })
            });

            if (response.status === 401) {
                return {
                    success: false,
                    error: 'auth_failed',
                    message: 'API key authentication failed. Please check your Groq API key in settings.'
                };
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: 'api_error',
                    message: `API error (${response.status}). Please try again later.`
                };
            }

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || '';

            if (!aiResponse) {
                return {
                    success: false,
                    error: 'empty_response',
                    message: 'Received empty response from AI. Please try again.'
                };
            }

            // Try to extract a verse reference from the response
            const verseInfo = this.extractVerseInfo(aiResponse, ayahDatabase);

            return {
                success: true,
                response: aiResponse,
                suggestedAyah: verseInfo.ayah,
                detectedEmotions: this.detectEmotions(userInput)
            };

        } catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    }

    // Build context string from ayah database
    buildAyahContext(ayahDatabase) {
        if (!ayahDatabase || !Array.isArray(ayahDatabase)) {
            return 'No verse database available.';
        }

        // Take a sample of verses with different themes
        const sampleSize = Math.min(50, ayahDatabase.length);
        const sampledAyahs = this.sampleDiverseAyahs(ayahDatabase, sampleSize);

        return sampledAyahs.map(ayah => 
            `- ${ayah.surah} ${ayah.surahNumber}:${ayah.ayahNumber} | Theme: ${ayah.theme || 'general'} | "${ayah.translation.substring(0, 100)}${ayah.translation.length > 100 ? '...' : ''}"`
        ).join('\n');
    }

    // Sample diverse ayahs from different themes
    sampleDiverseAyahs(ayahDatabase, sampleSize) {
        const themeGroups = {};
        
        // Group by theme
        ayahDatabase.forEach(ayah => {
            const theme = (ayah.theme || 'general').split(',')[0].trim();
            if (!themeGroups[theme]) {
                themeGroups[theme] = [];
            }
            themeGroups[theme].push(ayah);
        });

        const themes = Object.keys(themeGroups);
        const result = [];
        let themeIndex = 0;

        // Round-robin sample from each theme
        while (result.length < sampleSize && themes.length > 0) {
            const theme = themes[themeIndex % themes.length];
            if (themeGroups[theme].length > 0) {
                result.push(themeGroups[theme].shift());
            } else {
                themes.splice(themeIndex % themes.length, 1);
            }
            themeIndex++;
        }

        return result;
    }

    // Extract verse reference from AI response
    extractVerseInfo(aiResponse, ayahDatabase) {
        // Try to find verse references like "Surah Al-Baqarah 2:255" or "2:255"
        const versePatterns = [
            /(\d+):(\d+)/g,  // Simple format: 2:255
            /Surah\s+(\w+[-\s]?\w*)\s*[(\[]?(\d+):(\d+)/gi,  // Full format
        ];

        for (const pattern of versePatterns) {
            const matches = aiResponse.matchAll(pattern);
            for (const match of matches) {
                let surahNum, ayahNum;
                if (match.length === 3) {
                    [, surahNum, ayahNum] = match;
                } else if (match.length === 4) {
                    [, , surahNum, ayahNum] = match;
                }
                
                surahNum = parseInt(surahNum);
                ayahNum = parseInt(ayahNum);

                // Find matching ayah in database
                const ayah = ayahDatabase.find(a => 
                    a.surahNumber === surahNum && a.ayahNumber === ayahNum
                );

                if (ayah) {
                    return { ayah };
                }
            }
        }

        return { ayah: null };
    }

    // Simple emotion detection for highlighting
    detectEmotions(input) {
        const emotionKeywords = {
            'anxious': ['anxious', 'worried', 'nervous', 'stress', 'panic', 'overwhelmed'],
            'sad': ['sad', 'depressed', 'down', 'melancholy', 'sorrowful', 'crying'],
            'angry': ['angry', 'mad', 'furious', 'irritated', 'rage', 'frustrated'],
            'fearful': ['afraid', 'scared', 'fear', 'terrified', 'frightened'],
            'lonely': ['lonely', 'isolated', 'alone', 'abandoned'],
            'hopeless': ['hopeless', 'despair', 'giving up', 'no hope'],
            'grateful': ['grateful', 'thankful', 'blessed', 'appreciative'],
            'happy': ['happy', 'joyful', 'glad', 'delighted', 'cheerful', 'blessed'],
            'peaceful': ['peaceful', 'calm', 'serene', 'tranquil', 'content'],
            'seeking': ['seeking', 'searching', 'looking for', 'need guidance', 'help'],
            'guilty': ['guilty', 'ashamed', 'regret', 'remorse', 'wrong'],
            'lost': ['lost', 'confused', 'directionless', 'uncertain']
        };

        const detected = [];
        const lowerInput = input.toLowerCase();

        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            for (const keyword of keywords) {
                if (lowerInput.includes(keyword)) {
                    detected.push(emotion);
                    break;
                }
            }
        }

        return [...new Set(detected)]; // Remove duplicates
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get user settings
    async getSettings() {
        try {
            let groqApiKey = '';
            
            // Check for CONFIG.GROQ_API_KEY first (injected at build time)
            if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY !== 'GROQ_API_KEY') {
                groqApiKey = CONFIG.GROQ_API_KEY;
            } else {
                // Fallback to storage (for users who configure manually)
                const stored = await chrome.storage.sync.get({ groqApiKey: '' });
                groqApiKey = stored.groqApiKey || '';
            }

            return { groqApiKey };
        } catch (error) {
            console.error('Error getting settings:', error);
            return { groqApiKey: '' };
        }
    }

    // Legacy method for backward compatibility
    async findRelevantAyah(emotionalInput, ayahDatabase) {
        const result = await this.getGuidance(emotionalInput, ayahDatabase);
        
        if (result.success) {
            return {
                ayah: result.suggestedAyah || this.getRandomAyah(ayahDatabase, result.detectedEmotions),
                explanation: result.response,
                detectedEmotions: result.detectedEmotions,
                source: 'groq'
            };
        }

        // Fallback to random relevant ayah if API fails
        const fallbackAyah = this.getRandomAyah(ayahDatabase, this.detectEmotions(emotionalInput));
        return {
            ayah: fallbackAyah,
            explanation: result.message || 'Unable to get AI guidance. Here is a verse that may help.',
            detectedEmotions: this.detectEmotions(emotionalInput),
            source: 'fallback'
        };
    }

    // Get a random ayah that matches detected emotions
    getRandomAyah(ayahDatabase, emotions) {
        if (!ayahDatabase || ayahDatabase.length === 0) return null;

        // Try to find ayahs matching detected emotions
        if (emotions && emotions.length > 0) {
            const matchingAyahs = ayahDatabase.filter(ayah => {
                if (!ayah.emotions) return false;
                return emotions.some(emotion => 
                    ayah.emotions.some(e => e.toLowerCase().includes(emotion.toLowerCase()))
                );
            });

            if (matchingAyahs.length > 0) {
                return matchingAyahs[Math.floor(Math.random() * matchingAyahs.length)];
            }
        }

        // Fallback to any random ayah
        return ayahDatabase[Math.floor(Math.random() * ayahDatabase.length)];
    }
}

// Create global instance
(() => {
    const globalScope = (typeof window !== 'undefined') ? window : (typeof self !== 'undefined') ? self : this;
    globalScope.AIGuide = new AIGuide();
})();
