// favorites-analyzer.js - AI-powered analysis of user's saved favorites

class FavoritesAnalyzer {
    constructor() {
        // API key loaded from CONFIG
        this.groqApiKey = CONFIG.GROQ_API_KEY;
        this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    }

    /**
     * Analyze favorites and produce a summary
     * @param {Array} favorites - Array of saved Ayahs and Ahadith
     * @param {boolean} useLLM - Whether to use LLM (requires API key and consent)
     * @returns {Promise<Object>} Analysis result with interests, needs, meaning, and actions
     */
    async analyzeFavorites(favorites) {
        if (!favorites || favorites.length === 0) {
            return {
                success: false,
                error: 'No favorites to analyze. Save some Ayahs or Ahadith first.'
            };
        }

        try {
            // Always use LLM analysis with hardcoded API key
            return await this.analyzeFavoritesWithLLM(favorites);
        } catch (error) {
            console.error('Error analyzing favorites:', error);
            // Fallback to offline analysis only on error
            return await this.analyzeFavoritesOffline(favorites);
        }
    }

    /**
     * Offline analysis using keyword frequency and heuristics
     * @param {Array} favorites - Array of saved items
     * @returns {Object} Analysis summary
     */
    async analyzeFavoritesOffline(favorites) {
        try {
            // Extract themes and emotions from favorites
            const themeMap = new Map();
            const emotionMap = new Map();
            const sources = new Set();

            favorites.forEach(item => {
                // Count themes
                if (item.theme) {
                    const themes = item.theme.split(',').map(t => t.trim().toLowerCase());
                    themes.forEach(theme => {
                        themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
                    });
                }

                // Count emotions
                if (item.emotions && Array.isArray(item.emotions)) {
                    item.emotions.forEach(emotion => {
                        const emo = emotion.toLowerCase();
                        emotionMap.set(emo, (emotionMap.get(emo) || 0) + 1);
                    });
                }

                // Track sources
                if (item.surah) {
                    sources.add(item.surah);
                } else if (item.source) {
                    sources.add(item.source);
                }
            });

            // Sort by frequency
            const topThemes = Array.from(themeMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([theme]) => theme);

            const topEmotions = Array.from(emotionMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([emotion]) => emotion);

            // Generate interests summary
            const interests = this.generateInterestsSummary(topThemes, favorites.length);

            // Infer needs based on emotions
            const needs = this.inferNeeds(topEmotions);

            // Generate meaning and synthesis
            const meaning = this.generateMeaningSynthesis(topThemes, topEmotions, favorites.length);

            // Suggest actions
            const actions = this.suggestActions(topThemes, topEmotions);

            return {
                success: true,
                method: 'offline',
                analysis: {
                    interests,
                    needs,
                    meaning,
                    actions,
                    metadata: {
                        totalSaved: favorites.length,
                        topThemes: topThemes.slice(0, 3),
                        topEmotions: topEmotions.slice(0, 3),
                        uniqueSources: sources.size
                    }
                }
            };

        } catch (error) {
            console.error('Offline analysis error:', error);
            return {
                success: false,
                error: 'Failed to analyze favorites offline'
            };
        }
    }

    /**
     * LLM-assisted analysis using Groq API
     * @param {Array} favorites - Array of saved items
     * @returns {Promise<Object>} Rich analysis from LLM
     */
    async analyzeFavoritesWithLLM(favorites) {
        try {
            // Prepare data for LLM (no personal identifiers)
            const favoritesData = favorites.map(item => ({
                text: item.translation || item.text || '',
                arabic: item.arabic || '',
                theme: item.theme || '',
                emotions: item.emotions || [],
                source: item.surah || item.source || ''
            }));

            const prompt = this.buildLLMPrompt(favoritesData);

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.groqApiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a thoughtful Islamic scholar and spiritual guide with deep knowledge of the Quran and Hadith. Analyze the user\'s saved verses to provide personalized, insightful spiritual guidance. Be specific, contextual, and meaningful in your analysis. Draw connections between the verses and provide actionable spiritual advice based on patterns you observe.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.8,
                    max_completion_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`);
            }

            const result = await response.json();
            const aiResponse = result.choices[0].message.content;

            // Parse LLM response into structured format
            const parsedAnalysis = this.parseLLMResponse(aiResponse, favorites.length);

            return {
                success: true,
                method: 'llm',
                analysis: parsedAnalysis
            };

        } catch (error) {
            console.error('LLM analysis error:', error);
            // Fallback to offline
            console.log('Falling back to offline analysis...');
            return await this.analyzeFavoritesOffline(favorites);
        }
    }

    /**
     * Build prompt for LLM analysis
     */
    buildLLMPrompt(favoritesData) {
        const summary = favoritesData.map((item, index) => {
            const text = item.text || '';
            const arabic = item.arabic || '';
            const theme = item.theme || 'general';
            const emotions = item.emotions || [];
            const source = item.source || '';
            
            return `${index + 1}. "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"\n   Arabic: ${arabic.substring(0, 100)}\n   Source: ${source}\n   Themes: ${theme}\n   Related emotions: ${emotions.join(', ')}`;
        }).join('\n\n');

        return `As an Islamic scholar, analyze these ${favoritesData.length} saved Quranic verses and Hadith that a Muslim has bookmarked for spiritual guidance. Look deeply at the patterns, themes, and spiritual messages they reveal.

Saved Items:
${summary}

Provide a thoughtful, personalized spiritual analysis with these sections:

1. **INTERESTS**: Identify the main spiritual themes and topics this person gravitates toward. What does their selection reveal about their spiritual focus? Be specific and insightful.

2. **NEEDS**: Based on the verses they save, what spiritual or emotional needs can you infer? What are they seeking? (e.g., peace during hardship, guidance for decisions, strength in faith, comfort in loss, etc.)

3. **MEANING**: Provide a meaningful synthesis that connects these verses together. What story do they tell about this person's spiritual journey? What deeper patterns emerge? How do these selections complement each other?

4. **ACTIONS**: Suggest 4-6 specific, practical actions they can take to deepen their connection with these teachings. Be concrete and actionable.

Format your response exactly as:
INTERESTS: [your detailed analysis]
NEEDS: [your insights about their spiritual needs]
MEANING: [your synthesis and deeper meaning]
ACTIONS:\n1. [first action]\n2. [second action]\n3. [third action]\n4. [fourth action]\n5. [fifth action]`;
    }

    /**
     * Parse LLM response into structured format
     */
    parseLLMResponse(aiResponse, totalCount) {
        const sections = {
            interests: '',
            needs: '',
            meaning: '',
            actions: [],
            metadata: {
                totalSaved: totalCount
            }
        };

        try {
            // Extract sections using regex
            const interestsMatch = aiResponse.match(/INTERESTS:?\s*([^\n]+(?:\n(?!NEEDS:|MEANING:|ACTIONS:)[^\n]+)*)/i);
            const needsMatch = aiResponse.match(/NEEDS:?\s*([^\n]+(?:\n(?!INTERESTS:|MEANING:|ACTIONS:)[^\n]+)*)/i);
            const meaningMatch = aiResponse.match(/MEANING:?\s*([^\n]+(?:\n(?!INTERESTS:|NEEDS:|ACTIONS:)[^\n]+)*)/i);
            const actionsMatch = aiResponse.match(/ACTIONS:?\s*([\s\S]+?)(?=\n\n|$)/i);

            if (interestsMatch) sections.interests = interestsMatch[1].trim();
            if (needsMatch) sections.needs = needsMatch[1].trim();
            if (meaningMatch) sections.meaning = meaningMatch[1].trim();
            
            if (actionsMatch) {
                // Extract numbered actions
                const actionText = actionsMatch[1];
                const actionItems = actionText.split(/\n/).filter(line => {
                    return line.match(/^\d+\./) || line.match(/^[-•]/);
                }).map(line => line.replace(/^\d+\.\s*|^[-•]\s*/, '').trim());
                
                sections.actions = actionItems.length > 0 ? actionItems : [actionText.trim()];
            }

            // Fallback if parsing failed
            if (!sections.interests && !sections.needs && !sections.meaning) {
                sections.meaning = aiResponse;
                sections.interests = 'Various spiritual themes';
                sections.needs = 'Seeking guidance and peace';
            }

        } catch (error) {
            console.error('Error parsing LLM response:', error);
            sections.meaning = aiResponse;
        }

        return sections;
    }

    /**
     * Generate interests summary from themes
     */
    generateInterestsSummary(themes, totalCount) {
        if (themes.length === 0) {
            return 'You have saved various verses for reflection.';
        }

        const themeList = themes.slice(0, 3).join(', ');
        return `Your ${totalCount} saved items show recurring interest in: ${themeList}${themes.length > 3 ? ', and more' : ''}.`;
    }

    /**
     * Infer spiritual/emotional needs from emotions
     */
    inferNeeds(emotions) {
        const needsMap = {
            'anxiety': 'comfort and reassurance',
            'fear': 'courage and protection',
            'sadness': 'hope and healing',
            'anger': 'patience and peace',
            'gratitude': 'remembrance and thankfulness',
            'hope': 'strengthening faith',
            'peace': 'maintaining tranquility',
            'patience': 'steadfastness',
            'guidance': 'direction and wisdom',
            'comfort': 'solace and support',
            'joy': 'celebration and appreciation'
        };

        const inferredNeeds = emotions
            .map(emo => needsMap[emo.toLowerCase()])
            .filter(Boolean);

        if (inferredNeeds.length === 0) {
            return 'Seeking spiritual growth and understanding.';
        }

        return `You may be seeking: ${inferredNeeds.slice(0, 3).join(', ')}.`;
    }

    /**
     * Generate meaning and synthesis
     */
    generateMeaningSynthesis(themes, emotions, totalCount) {
        const themeText = themes.slice(0, 2).join(' and ');
        const emotionText = emotions.slice(0, 2).join(' and ');

        if (!themeText && !emotionText) {
            return `Your collection of ${totalCount} saved verses reflects a journey of spiritual discovery and growth.`;
        }

        let synthesis = `Your collection reveals a spiritual journey focused on ${themeText || 'personal growth'}`;
        
        if (emotionText) {
            synthesis += `, often seeking guidance during times of ${emotionText}`;
        }

        synthesis += '. These selections suggest a thoughtful approach to finding peace and wisdom through divine teachings.';

        return synthesis;
    }

    /**
     * Suggest practical actions
     */
    suggestActions(themes, emotions) {
        const actions = [];

        // Theme-based suggestions
        if (themes.includes('prayer')) {
            actions.push('Establish or strengthen your daily prayer routine');
        }
        if (themes.includes('patience')) {
            actions.push('Practice mindful patience in challenging situations this week');
        }
        if (themes.includes('charity')) {
            actions.push('Consider contributing to a cause that resonates with you');
        }
        if (themes.includes('gratitude')) {
            actions.push('Keep a daily gratitude journal for the next 7 days');
        }

        // Emotion-based suggestions
        if (emotions.includes('anxiety') || emotions.includes('fear')) {
            actions.push('Dedicate 10 minutes daily for dhikr (remembrance) to calm your heart');
        }
        if (emotions.includes('hope')) {
            actions.push('Share an inspiring verse with someone who might need encouragement');
        }

        // General suggestions
        actions.push('Review your saved verses weekly to reinforce their lessons');
        actions.push('Choose one verse to reflect deeply on each day');
        
        if (actions.length > 5) {
            return actions.slice(0, 5);
        }

        // Ensure at least 3 actions
        while (actions.length < 3) {
            const generalActions = [
                'Memorize one of your favorite saved verses',
                'Share a meaningful verse with family or friends',
                'Set a reminder to read one saved verse before sleep'
            ];
            const toAdd = generalActions[actions.length % generalActions.length];
            if (!actions.includes(toAdd)) {
                actions.push(toAdd);
            }
        }

        return actions;
    }
}

// Make available globally for popup
window.FavoritesAnalyzer = new FavoritesAnalyzer();
