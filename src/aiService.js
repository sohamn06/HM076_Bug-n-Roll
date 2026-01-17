// Puter.js is loaded via CDN in index.html
// Access it via the global window.puter object

/**
 * Generate marketing caption using Puter.js AI
 */
export const generateCaption = async (topic, platform = 'Instagram', tone = 'casual') => {
    try {
        const toneInstructions = {
            professional: "professional, business-appropriate tone",
            casual: "friendly, conversational tone with emojis",
            playful: "fun, energetic tone with lots of emojis",
            inspirational: "uplifting, motivational tone"
        };

        const platformLimits = {
            instagram: "Include 5-10 hashtags",
            twitter: "Under 280 characters with 1-2 hashtags",
            linkedin: "Professional with 3-5 hashtags",
            facebook: "Engaging and conversational"
        };

        const prompt = `Create a ${toneInstructions[tone] || 'casual'} social media post for ${platform} about: ${topic}. ${platformLimits[platform.toLowerCase()] || ''}. No markdown formatting.`;

        console.log('🚀 Using Puter.js AI...');

        // Use global puter object from CDN
        const response = await window.puter.ai.chat(prompt);

        console.log('✅ Caption generated!');
        return response;

    } catch (error) {
        console.error("Error:", error);
        return `Error: ${error.message}`;
    }
};

/**
 * Generate AI image using Puter.js (Nano Banana)
 */
export const generateImage = async (prompt) => {
    try {
        console.log('🎨 Using Puter.js for image generation...');

        const result = await window.puter.ai.txt2img(prompt);
        console.log('Puter result type:', typeof result, result);

        // Puter.js returns an HTML img element with src containing base64 data
        if (result && result.tagName === 'IMG') {
            const src = result.src;
            // Extract base64 from data URL: "data:image/png;base64,xxxxx"
            const base64Data = src.split(',')[1];

            console.log('✅ Image generated from img element!');
            return {
                success: true,
                imageUrl: base64Data,
                isBase64: true
            };
        } else if (result instanceof Blob) {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(result);
            });

            const base64Data = await base64Promise;
            console.log('✅ Image generated from Blob!');
            return {
                success: true,
                imageUrl: base64Data,
                isBase64: true
            };
        } else if (typeof result === 'string') {
            // If it's already a string (base64 or URL)
            console.log('✅ Image generated as string!');
            return {
                success: true,
                imageUrl: result.startsWith('data:') ? result.split(',')[1] : result,
                isBase64: true
            };
        } else {
            throw new Error(`Unexpected result type: ${typeof result}`);
        }

    } catch (error) {
        console.error("Image generation error:", error);
        return {
            success: false,
            error: error.message || 'Image generation failed',
            suggestion: `Try using this prompt with DALL-E or Midjourney: "${prompt}"`
        };
    }
};

// Helper functions
export const extractHashtags = (text) => {
    return text.match(/#[\w]+/g) || [];
};

export const optimizeHashtags = (hashtags, platform) => {
    const limits = {
        instagram: 30,
        twitter: 2,
        linkedin: 5,
        facebook: 10
    };
    return hashtags.slice(0, limits[platform.toLowerCase()] || 5);
};

export const checkCharacterLimit = (text, platform) => {
    const limits = {
        instagram: 2200,
        twitter: 280,
        linkedin: 3000,
        facebook: 63206
    };
    const limit = limits[platform.toLowerCase()] || 280;
    return {
        length: text.length,
        limit,
        withinLimit: text.length <= limit,
        remaining: limit - text.length
    };
};

export const adaptContentForPlatform = async (content, targetPlatform) => {
    const platform = targetPlatform.toLowerCase();
    const hashtags = extractHashtags(content);
    const contentWithout = content.replace(/#[\w]+/g, '').trim();

    let adapted = contentWithout;
    const optimized = optimizeHashtags(hashtags, platform);

    // For LinkedIn, use AI to make it more professional
    if (platform === 'linkedin') {
        try {
            const prompt = `Rewrite this for LinkedIn in a professional B2B tone (no markdown): ${contentWithout}`;
            adapted = await window.puter.ai.chat(prompt);
        } catch (error) {
            console.error('LinkedIn adaptation error:', error);
        }
    }

    if (platform === 'twitter' && adapted.length > 250) {
        adapted = adapted.substring(0, 247) + '...';
    }

    if (optimized.length > 0) {
        adapted += '\n\n' + optimized.join(' ');
    }

    return {
        platform: targetPlatform,
        success: true,
        content: adapted,
        hashtags: optimized,
        ...checkCharacterLimit(adapted, platform)
    };
};

export const adaptContentForAllPlatforms = async (content) => {
    const platforms = ['instagram', 'twitter', 'linkedin', 'facebook'];
    const results = {};

    for (const platform of platforms) {
        results[platform] = await adaptContentForPlatform(content, platform);
    }

    return results;
};