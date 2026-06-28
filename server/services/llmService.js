import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Load the keys in the exact sandwich order you specified
const llmProviders = [
    { name: 'Groq 1', provider: 'groq', key: process.env.GROQ_API_KEY_1 },
    { name: 'OpenRouter', provider: 'openrouter', key: process.env.OPENROUTER_API_KEY },
    { name: 'Groq 2', provider: 'groq', key: process.env.GROQ_API_KEY_2 }
].filter(p => p.key);

let currentProviderIndex = 0;

export const generateChatResponse = async (userQuery, retrievedContext, retryCount = 0) => {
    if (llmProviders.length === 0) throw new Error("No LLM API keys configured.");

    const activeProvider = llmProviders[currentProviderIndex];
    
    // Construct the prompt with RAG context
    const systemPrompt = `You are Codexa, an expert AI coding assistant. Answer the user's question based ONLY on the provided codebase context. If the context does not contain the answer, say "I cannot find the answer in the provided codebase."\n\nContext:\n${retrievedContext}`;
    
    let url = "";
    let model = "";
    let headers = { "Content-Type": "application/json" };

    if (activeProvider.provider === 'groq') {
        url = "https://api.groq.com/openai/v1/chat/completions";
        model = "llama-3.3-70b-versatile"; // Best free Groq model
        headers["Authorization"] = `Bearer ${activeProvider.key}`;
    } else if (activeProvider.provider === 'openrouter') {
        url = "https://openrouter.ai/api/v1/chat/completions";
        model = "meta-llama/llama-3.1-8b-instruct:free"; // 100% Free OpenRouter model
        headers["Authorization"] = `Bearer ${activeProvider.key}`;
        headers["HTTP-Referer"] = "http://localhost:5000"; 
        headers["X-Title"] = "Codexa AI";
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery }
                ],
                temperature: 0.3 // Low temperature for precise code answers
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || response.statusText);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.warn(`[Warning] ${activeProvider.name} failed: ${error.message}`);

        if (retryCount < llmProviders.length - 1) {
            currentProviderIndex = (currentProviderIndex + 1) % llmProviders.length;
            console.log(`[Fallback] Switching LLM Engine to ${llmProviders[currentProviderIndex].name}...`);
            return generateChatResponse(userQuery, retrievedContext, retryCount + 1);
        } else {
            throw new Error("Critical: All LLM providers (Groq & OpenRouter) have failed.");
        }
    }
};