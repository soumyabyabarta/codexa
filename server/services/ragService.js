import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

let inMemoryDocs = [];

const mistralKeys = [
    process.env.MISTRAL_API_KEY_1,
    process.env.MISTRAL_API_KEY_2
].filter(Boolean);

let currentMistralIndex = 0;

// Embeddings with Fallback
const fetchMistralEmbeddings = async (texts, retryCount = 0) => {
    if (mistralKeys.length === 0) throw new Error("No Mistral API keys configured.");

    const apiKey = mistralKeys[currentMistralIndex];
    const url = "https://api.mistral.ai/v1/embeddings";
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model: "mistral-embed", input: texts })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || response.statusText);
        }

        const data = await response.json();
        return data.data.map(item => item.embedding);
    } catch (error) {
        console.warn(`[Warning] Mistral Key ${currentMistralIndex + 1} failed: ${error.message}`);
        
        if (retryCount < mistralKeys.length - 1) {
            currentMistralIndex = (currentMistralIndex + 1) % mistralKeys.length;
            console.log(`[Fallback] Switching to Mistral API Key ${currentMistralIndex + 1}...`);
            return fetchMistralEmbeddings(texts, retryCount + 1);
        } else {
            throw new Error("Critical: All Mistral API keys have failed.");
        }
    }
};

const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const createVectorStore = async (chunks) => {
    console.log(`Generating embeddings using Mistral AI (${mistralKeys.length} keys loaded)...`);
    inMemoryDocs = [];
    const BATCH_SIZE = 50; 
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        try {
            const batchChunks = chunks.slice(i, i + BATCH_SIZE);
            const batchTexts = batchChunks.map(chunk => chunk.pageContent);
            
            const embeddings = await fetchMistralEmbeddings(batchTexts);
            
            for (let j = 0; j < batchChunks.length; j++) {
                inMemoryDocs.push({
                    metadata: batchChunks[j].metadata,
                    pageContent: batchChunks[j].pageContent,
                    embedding: embeddings[j]
                });
            }
            console.log(`Processed ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks...`);
            
            if (i + BATCH_SIZE < chunks.length) {
                await new Promise(r => setTimeout(r, 1200)); // Respect Mistral's 1 RPS
            }
        } catch (e) {
            console.error(`Process aborted at batch ${i}: ${e.message}`);
            throw e; 
        }
    }
    console.log("Successfully saved all chunks into Custom Memory Vector Store!");
    return true;
};

export const searchRelevantCode = async (query, topK = 5) => {
    if (inMemoryDocs.length === 0) throw new Error("Vector store is empty.");
    
    const embeddings = await fetchMistralEmbeddings([query]);
    const queryVector = embeddings[0];
    
    const scoredDocs = inMemoryDocs.map(doc => ({
        metadata: doc.metadata,
        pageContent: doc.pageContent,
        score: cosineSimilarity(queryVector, doc.embedding)
    }));

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
};