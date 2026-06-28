import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const llmProviders = [
    { name: 'Groq 1', provider: 'groq', key: process.env.GROQ_API_KEY_1 },
    { name: 'OpenRouter', provider: 'openrouter', key: process.env.OPENROUTER_API_KEY },
    { name: 'Groq 2', provider: 'groq', key: process.env.GROQ_API_KEY_2 }
].filter(p => p.key);

let currentProviderIndex = 0;

export const getGroqResponseWithFallback = async (userQuery, retrievedContext, retryCount = 0) => {
    if (llmProviders.length === 0) throw new Error("No LLM API keys configured.");

    const activeProvider = llmProviders[currentProviderIndex];
    
    // Safety check: Ensure userQuery is ALWAYS a valid string
    const safeQuery = userQuery && typeof userQuery === 'string' 
        ? userQuery 
        : typeof userQuery === 'object' ? JSON.stringify(userQuery) : String(userQuery || "Explain the codebase");

    const systemPrompt = `You are Codexa, an expert AI coding assistant. Answer the user's question based ONLY on the provided codebase context. If the context does not contain the answer, say "I cannot find the answer in the provided codebase."\n\nContext:\n${retrievedContext}`;
    
    let url = "";
    let modelId = "";
    let headers = { "Content-Type": "application/json" };

    if (activeProvider.provider === 'groq') {
        url = "https://api.groq.com/openai/v1/chat/completions";
        modelId = "llama-3.3-70b-versatile"; 
        headers["Authorization"] = `Bearer ${activeProvider.key}`;
    } else if (activeProvider.provider === 'openrouter') {
        url = "https://openrouter.ai/api/v1/chat/completions";
        // Switched to a 100% guaranteed FREE and powerful model
        modelId = "google/gemma-2-9b-it:free"; 
        headers["Authorization"] = `Bearer ${activeProvider.key}`;
        headers["HTTP-Referer"] = "http://localhost:5000"; 
        headers["X-Title"] = "Codexa AI";
    }

    try {
        console.log(`Trying ${activeProvider.name}...`);
        
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: safeQuery } // Passing the strictly validated string
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.warn(`[Warning] ${activeProvider.name} Failed: ${error.message}`);

        if (retryCount < llmProviders.length - 1) {
            currentProviderIndex = (currentProviderIndex + 1) % llmProviders.length;
            console.log(`[Fallback] Switching LLM Engine to ${llmProviders[currentProviderIndex].name}...`);
            return getGroqResponseWithFallback(userQuery, retrievedContext, retryCount + 1);
        } else {
            throw new Error(`Critical: All LLM providers have failed. Last error: ${error.message}`);
        }
    }
};