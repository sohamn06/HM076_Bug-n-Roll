const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateMarketingCopy = async (topic, platform) => {
    try {
        if (!API_KEY) return "Error: API Key is missing. Restart server or check .env.";

        // Find available models
        const listResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        const listData = await listResponse.json();

        if (listData.error) {
            return `API Error: ${listData.error.message}`;
        }

        // Select best model (flash > pro)
        const validModel = listData.models?.find(m =>
            m.supportedGenerationMethods.includes("generateContent") &&
            (m.name.includes("flash") || m.name.includes("pro"))
        );

        if (!validModel) {
            return "Error: No text-generation models found for your API Key.";
        }

        console.log(`🚀 Using: ${validModel.name}`);

        // Generate Content with improved prompt for clean output
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Write ONE ${platform} post about "${topic}". Make it exciting with emojis and hashtags. DO NOT use markdown formatting (no **, >, #, etc.). Just write the plain text post ready to copy-paste. Keep it under 200 words.`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            let text = data.candidates[0].content.parts[0].text;

            // Clean up any markdown formatting that might slip through
            text = text
                .replace(/\*\*/g, '')        // Remove bold markers
                .replace(/\*/g, '')          // Remove italic markers  
                .replace(/^>\s*/gm, '')      // Remove quote markers
                .replace(/^#{1,6}\s/gm, '')  // Remove heading markers
                .trim();

            console.log("✅ Content generated!");
            return text;
        } else {
            return "Error: Model returned no text. Try again.";
        }

    } catch (error) {
        console.error("Network Error:", error);
        return "Error: Could not connect to Google AI.";
    }
};