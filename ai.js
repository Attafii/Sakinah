// ai.js - Enhanced AI Guide logic with Groq API integration

class AIGuide {
    constructor() {
        // Groq API key must not be hardcoded. It will be read from chrome.storage.sync at runtime.
        this.groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        this.useGroqAPI = true; // Can be toggled in settings
        
        this.emotionKeywords = {
            // Anxiety and worry
            'anxious': ['anxious', 'worried', 'nervous', 'stress', 'panic', 'overwhelmed'],
            'stressed': ['stressed', 'pressure', 'burden', 'overwhelmed', 'exhausted'],
            'fearful': ['afraid', 'scared', 'fear', 'terrified', 'frightened', 'insecure'],
            
            // Sadness and grief
            'sad': ['sad', 'depressed', 'down', 'melancholy', 'blue', 'sorrowful'],
            'grief': ['grief', 'loss', 'mourning', 'bereaved', 'heartbroken'],
            'lonely': ['lonely', 'isolated', 'alone', 'abandoned', 'disconnected'],
            
            // Anger and frustration
            'angry': ['angry', 'mad', 'furious', 'irritated', 'rage'],
            'frustrated': ['frustrated', 'annoyed', 'fed up', 'impatient'],
            
            // Guilt and remorse
            'guilty': ['guilty', 'ashamed', 'regret', 'remorse', 'wrong'],
            'sinful': ['sinful', 'transgressed', 'disobedient', 'astray'],
            
            // Seeking and searching
            'lost': ['lost', 'confused', 'directionless', 'aimless', 'uncertain'],
            'seeking': ['seeking', 'searching', 'looking for', 'need guidance', 'help'],
            'hopeless': ['hopeless', 'despair', 'giving up', 'no hope', 'pointless'],
            
            // Positive emotions
            'grateful': ['grateful', 'thankful', 'blessed', 'appreciative'],
            'peaceful': ['peaceful', 'calm', 'serene', 'tranquil', 'content'],
            'hopeful': ['hopeful', 'optimistic', 'positive', 'looking forward'],
            
            // Spiritual states
            'devoted': ['devoted', 'spiritual', 'religious', 'worship', 'pray'],
            'seeking_forgiveness': ['forgiveness', 'mercy', 'pardon', 'absolve'],
            'need_strength': ['strength', 'power', 'energy', 'motivation', 'courage'],
            
            // Life situations
            'financial_worry': ['money', 'financial', 'poor', 'debt', 'income', 'poverty'],
            'relationship_issues': ['marriage', 'spouse', 'family', 'conflict', 'divorce'],
            'health_concerns': ['sick', 'illness', 'health', 'disease', 'pain', 'healing'],
            'career_stress': ['job', 'work', 'career', 'employment', 'boss', 'colleague'],
            'student_pressure': ['exam', 'study', 'school', 'university', 'grades']
        };

        this.ayahMappings = {
            // Anxiety and stress relief
            'anxious': [7, 49, 5, 3, 29], // Remembrance brings peace, with hardship comes ease, Allah doesn't burden beyond capacity
            'stressed': [5, 49, 11, 29], // Allah doesn't burden beyond capacity, ease after hardship
            'fearful': [4, 41, 7, 25], // Ayat al-Kursi, protection, trust in Allah
            'overwhelmed': [5, 11, 49, 3], // Not burdened beyond capacity, Quran not for distress
            
            // Sadness and grief
            'sad': [49, 48, 21, 44], // Ease after hardship, hope for future, peace
            'grief': [15, 26, 49], // Concern for others, ease after hardship
            'lonely': [3, 24, 28], // Allah is near, call upon Him
            'heartbroken': [3, 23, 49], // Allah is near, hope, ease
            
            // Anger and frustration
            'angry': [6, 33, 43], // Mercy and gentleness, patience
            'frustrated': [33, 47, 43], // Patience, diverse paths
            'impatient': [33, 49], // Patience, ease after hardship
            
            // Guilt and seeking forgiveness
            'guilty': [12, 22, 23, 40], // Seeking forgiveness, no despair
            'sinful': [23, 12, 40], // No despair from Allah's mercy, forgiveness
            'remorse': [12, 22, 6], // Repentance, seeking forgiveness
            'ashamed': [23, 40, 6], // Mercy, forgiveness
            
            // Lost and seeking guidance
            'lost': [13, 24, 9], // Light of Allah, guidance, worship until certainty
            'confused': [9, 47, 37], // Worship until certainty, diverse paths, reminder
            'seeking_guidance': [10, 24, 18], // Call upon Allah, light, advice
            'uncertain': [14, 29, 25], // Trust in Allah, sufficient, Ever-Living
            'directionless': [30, 9, 18], // Purpose of life, worship, guidance
            
            // Despair and hopelessness
            'hopeless': [23, 48, 49], // No despair, future is better, ease
            'despair': [23, 16, 40], // Don't despair of Allah's mercy
            'giving_up': [23, 49, 25], // No despair, ease, trust
            
            // Seeking help and support
            'need_help': [24, 16, 3], // Call upon Me, answers desperate, Allah is near
            'desperate': [16, 24, 3], // Answers the desperate, call upon Me
            'crisis': [16, 24, 49], // Emergency help, ease after hardship
            'emergency': [16, 24, 7], // Immediate help, peace
            
            // Spiritual seeking
            'spiritual_growth': [32, 19, 34], // Devotion, worship, charity
            'seeking_closeness': [32, 19, 7], // Devotion, night prayer, remembrance
            'worship': [9, 32, 42], // Worship until certainty, devotion, exaltation
            'prayer_guidance': [10, 24, 19], // Beautiful names, call upon Allah
            
            // Life circumstances
            'financial_stress': [20, 8], // Allah provides, gratitude brings more
            'money_worries': [20, 8], // Best of providers, gratitude
            'poverty': [20, 8, 34], // Provision, charity
            'relationship_problems': [6, 28, 43], // Mercy, forgiveness, letting go
            'family_issues': [28, 6, 18], // Forgiveness for community, advice
            'health_concerns': [27, 16, 3], // Divine mercy, healing
            'work_stress': [39, 17, 30], // Striving, balance, purpose
            
            // Character and self-improvement
            'self_improvement': [31, 36, 46], // Character, self-control, soul reflection
            'moral_guidance': [31, 18, 36], // Character, advice, self-control
            'self_control': [36, 46], // Preventing soul from desires, balance
            'discipline': [36, 32], // Self-control, devotion
            
            // Gratitude and positive states
            'grateful': [8, 2, 35, 42], // Gratitude brings more, praise, mercy
            'thankful': [8, 2, 42], // Gratitude, praise, exaltation
            'blessed': [8, 2, 50], // Increase, praise, best creation
            'content': [44, 21, 7], // Peaceful soul, peace, tranquility
            'peaceful': [21, 44, 7], // Peace, reassured soul, tranquility
            
            // Hope and future
            'hopeful': [48, 8, 49], // Future is better, increase, ease
            'optimistic': [48, 8, 23], // Future better, increase, mercy
            'looking_forward': [48, 39, 29], // Future, striving, trust
            
            // Patience and perseverance
            'need_patience': [33, 18, 49], // Patience, perseverance, ease
            'perseverance': [25, 39, 33], // Steadfastness, striving, patience
            'endurance': [45, 39, 33], // Hardship, striving, patience
            
            // Protection and safety
            'need_protection': [4, 41, 25], // Ayat al-Kursi, guardian, Ever-Living
            'safety': [41, 4, 7], // Protector, power, peace
            'security': [14, 29, 4], // Trust, sufficiency, protection
            
            // Reflection and contemplation
            'contemplating': [30, 35, 46], // Purpose of life, creation, soul
            'reflecting': [26, 46, 47], // Trials, soul, diverse efforts
            'philosophical': [30, 50, 35], // Life purpose, human dignity, creation
            
            // Special situations
            'starting_new': [1, 8, 25], // Beginning, increase, trust
            'making_decisions': [29, 14, 37], // Trust Allah, trust, reminder
            'facing_change': [29, 49, 25], // Trust, ease, reliance
            'preparing_for_meeting_allah': [39, 30, 9], // Striving, purpose, worship
            'death_anxiety': [39, 9, 30], // Meeting Allah, worship, purpose
            
            // Community and others
            'caring_for_others': [34, 28, 15], // Pure charity, forgiveness for others, concern
            'wanting_to_help': [34, 28], // Feeding others, community
            'community_issues': [28, 38, 43], // Collective forgiveness, guidance not forcing
            'sharing_knowledge': [38, 37], // Universal guidance, reminder
            
            // Specific virtues
            'humility': [2, 22, 12], // Praise to Allah, repentance, humility
            'sincerity': [34, 32], // Pure intentions, devotion
            'charity': [34, 20, 28], // Feeding others, spending, community
            'excellence': [31, 39], // Great character, striving
            'steadfastness': [25, 32, 33] // Remaining on course, devotion, patience
        };
    }

    // Main function to find relevant Ayah based on emotional state
    async findRelevantAyah(emotionalInput, ayahDatabase) {
        try {
            // Check if user wants to use Groq API and if available
            const settings = await this.getSettings();
            
            if (settings.useGroqAPI && settings.groqApiKey) {
                try {
                    const groqResult = await this.findAyahWithGroq(emotionalInput, ayahDatabase);
                    if (groqResult) {
                        return groqResult;
                    }
                } catch (error) {
                    console.log('Groq API failed, falling back to offline mode:', error);
                }
            }
            
            // Fallback to offline processing
            return await this.findAyahOffline(emotionalInput, ayahDatabase);
            
        } catch (error) {
            console.error('Error in AI Guide:', error);
            return null;
        }
    }

    // Enhanced Groq API integration for emotion analysis
    async findAyahWithGroq(emotionalInput, ayahDatabase) {
        try {
            const prompt = this.buildGroqPrompt(emotionalInput, ayahDatabase);
            // Read the API key from secure storage at runtime
            const stored = await chrome.storage.sync.get({ groqApiKey: '' });
            const apiKey = stored.groqApiKey;

            if (!apiKey) throw new Error('Groq API key not configured');

            const response = await fetch(this.groqEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a compassionate Islamic spiritual guide helping Muslims find relevant Quran verses for their emotional states. Respond with valid JSON only.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            return this.parseGroqResponse(aiResponse, ayahDatabase);
            
        } catch (error) {
            console.error('Groq API error:', error);
            throw error;
        }
    }

    // Build prompt for Groq API
    buildGroqPrompt(emotionalInput, ayahDatabase) {
        const ayahList = ayahDatabase.slice(0, 20).map(ayah => 
            `ID: ${ayah.id}, Theme: ${ayah.theme}, Emotions: ${ayah.emotions.join(', ')}, Translation: ${ayah.translation.substring(0, 100)}...`
        ).join('\n');

        return `
User's emotional state: "${emotionalInput}"

Available Quran verses (first 20 for context):
${ayahList}

Please analyze the user's emotional state and suggest the most relevant Quran verse ID from the database. 

Respond with ONLY this JSON format:
{
  "ayahId": [number],
  "emotionalAnalysis": "[brief analysis of user's emotions]",
  "explanation": "[why this Ayah is relevant to their state]",
  "confidence": [0.1-1.0]
}

Consider:
- Deep emotional context and Islamic spiritual guidance
- Therapeutic value of the suggested verse
- Cultural and religious sensitivity
- Compassionate understanding of human struggles
        `;
    }

    // Parse Groq API response
    parseGroqResponse(aiResponse, ayahDatabase) {
        try {
            // Clean the response to extract JSON
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            const ayah = ayahDatabase.find(a => a.id === parsed.ayahId);
            
            if (!ayah) {
                throw new Error('Invalid Ayah ID returned');
            }

            return {
                ayah: ayah,
                explanation: `${parsed.emotionalAnalysis}\n\n${parsed.explanation}`,
                confidence: parsed.confidence || 0.8,
                source: 'groq'
            };
            
        } catch (error) {
            console.error('Error parsing Groq response:', error);
            throw error;
        }
    }

    // Fallback offline processing (original method)
    async findAyahOffline(emotionalInput, ayahDatabase) {
        try {
            const emotions = this.analyzeEmotion(emotionalInput.toLowerCase());
            const relevantAyahIds = this.getRelevantAyahIds(emotions);
            
            if (relevantAyahIds.length === 0) {
                // Fallback to general comfort ayahs
                const fallbackIds = [7, 49, 3, 23]; // Peace, ease, nearness, mercy
                const randomFallback = fallbackIds[Math.floor(Math.random() * fallbackIds.length)];
                const ayah = ayahDatabase.find(a => a.id === randomFallback);
                return {
                    ayah: ayah,
                    explanation: "Here's a comforting verse from the Qur'an that may bring you peace and strength."
                };
            }

            // Score and select the best ayah
            const scoredAyahs = this.scoreAyahs(relevantAyahIds, emotions, ayahDatabase);
            const selectedAyah = this.selectBestAyah(scoredAyahs);
            
            const explanation = this.generateExplanation(selectedAyah.ayah, emotions, emotionalInput);

            return {
                ayah: selectedAyah.ayah,
                explanation: explanation,
                source: 'offline'
            };

        } catch (error) {
            console.error('Error in offline AI processing:', error);
            return null;
        }
    }

    // Get user settings for API preferences
    async getSettings() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const settings = await chrome.storage.sync.get({
                    useGroqAPI: true,
                    aiResponseStyle: 'detailed',
                    offlineMode: false
                });
                return {
                    useGroqAPI: settings.useGroqAPI && !settings.offlineMode,
                    responseStyle: settings.aiResponseStyle
                };
            }
            return { useGroqAPI: true, responseStyle: 'detailed' };
        } catch (error) {
            console.error('Error getting settings:', error);
            return { useGroqAPI: false, responseStyle: 'detailed' };
        }
    }

    // Analyze the emotional input and extract emotions
    analyzeEmotion(input) {
        const detectedEmotions = [];
        
        for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
            for (const keyword of keywords) {
                if (input.includes(keyword)) {
                    detectedEmotions.push({
                        emotion: emotion,
                        confidence: this.calculateConfidence(keyword, input),
                        keyword: keyword
                    });
                }
            }
        }

        // Sort by confidence and return top emotions
        return detectedEmotions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3); // Top 3 emotions
    }

    // Calculate confidence score for emotion detection
    calculateConfidence(keyword, input) {
        let confidence = 0.5; // Base confidence
        
        // Exact word match gets higher score
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (wordBoundaryRegex.test(input)) {
            confidence += 0.3;
        }
        
        // Length of keyword affects confidence
        confidence += (keyword.length / 20);
        
        // Position in sentence affects confidence
        const position = input.indexOf(keyword) / input.length;
        if (position < 0.3) confidence += 0.1; // Early in sentence
        
        return Math.min(confidence, 1.0);
    }

    // Get relevant Ayah IDs based on detected emotions
    getRelevantAyahIds(emotions) {
        const ayahIds = new Set();
        
        emotions.forEach(emotionData => {
            const mappings = this.ayahMappings[emotionData.emotion];
            if (mappings) {
                mappings.forEach(id => ayahIds.add(id));
            }
        });

        return Array.from(ayahIds);
    }

    // Score ayahs based on relevance to emotions
    scoreAyahs(ayahIds, emotions, ayahDatabase) {
        return ayahIds.map(id => {
            const ayah = ayahDatabase.find(a => a.id === id);
            if (!ayah) return null;

            let score = 0;
            
            emotions.forEach(emotionData => {
                // Check if this ayah is mapped to this emotion
                const mappings = this.ayahMappings[emotionData.emotion];
                if (mappings && mappings.includes(id)) {
                    score += emotionData.confidence;
                }
                
                // Check theme matching
                if (ayah.theme) {
                    emotionData.keyword.split(' ').forEach(word => {
                        if (ayah.theme.toLowerCase().includes(word.toLowerCase())) {
                            score += 0.2;
                        }
                    });
                }
                
                // Check emotion array matching
                if (ayah.emotions) {
                    ayah.emotions.forEach(ayahEmotion => {
                        if (ayahEmotion.toLowerCase().includes(emotionData.keyword.toLowerCase()) ||
                            emotionData.keyword.toLowerCase().includes(ayahEmotion.toLowerCase())) {
                            score += 0.3;
                        }
                    });
                }
            });

            return { ayah, score };
        }).filter(item => item !== null);
    }

    // Select the best ayah from scored options
    selectBestAyah(scoredAyahs) {
        if (scoredAyahs.length === 0) return null;
        
        // Sort by score and add some randomness to avoid always showing the same ayah
        scoredAyahs.sort((a, b) => b.score - a.score);
        
        // Select from top 3 to add variety
        const topAyahs = scoredAyahs.slice(0, 3);
        const randomIndex = Math.floor(Math.random() * topAyahs.length);
        
        return topAyahs[randomIndex];
    }

    // Generate explanation for why this ayah was chosen
    generateExplanation(ayah, emotions, originalInput) {
        const primaryEmotion = emotions[0];
        const explanations = {
            'anxious': `This verse reminds us that Allah is always near and brings peace to anxious hearts. When we remember Allah, our worries begin to fade.`,
            'stressed': `This ayah teaches us that Allah never burdens us beyond our capacity. Your current challenges are within your ability to handle with Allah's help.`,
            'fearful': `This powerful verse offers divine protection and reminds us that Allah is always watching over us. Let it be a source of strength against your fears.`,
            'sad': `This verse brings hope and comfort, reminding us that after every difficulty comes relief. Your sadness will give way to joy, In Sha Allah.`,
            'lonely': `Remember that Allah is closer to you than your jugular vein. You are never truly alone when you turn to Him in prayer and remembrance.`,
            'angry': `This verse speaks of mercy and gentleness. Channel your anger into patience and seek Allah's help to respond with wisdom rather than emotion.`,
            'guilty': `Allah's mercy is vast and His forgiveness is always available to those who seek it sincerely. Don't let guilt overwhelm you - turn to Allah in repentance.`,
            'lost': `This verse provides guidance for those who feel directionless. Allah is the light that illuminates the path forward when we seek His guidance.`,
            'hopeless': `Never despair of Allah's mercy. This verse reminds us that hope in Allah is always justified, no matter how dark things may seem.`,
            'grateful': `Your gratitude is beautiful. This verse reminds us that when we are thankful, Allah increases His blessings upon us.`,
            'seeking': `This verse responds to your search for guidance. Allah hears those who call upon Him and provides direction to sincere seekers.`
        };

        let explanation = explanations[primaryEmotion?.emotion];
        
        if (!explanation) {
            explanation = `This verse from the Qur'an offers guidance and comfort for your current situation. Reflect on its meaning and let it bring peace to your heart.`;
        }

        // Add theme-specific context
        if (ayah.theme) {
            const themes = ayah.theme.split(', ');
            if (themes.length > 0) {
                explanation += ` The theme of ${themes[0]} in this ayah particularly addresses what you're experiencing.`;
            }
        }

        return explanation;
    }
}

// Create global instance
window.AIGuide = new AIGuide();