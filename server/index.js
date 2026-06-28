import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getRelevantFiles, chunkFiles } from './utils/fileProcessor.js';
import { createVectorStore, searchRelevantCode } from './services/ragService.js';
import { getGroqResponseWithFallback } from './utils/llmFallback.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post('/api/repo/clone', async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'GitHub URL is required' });
    }

    try {
        const repoName = repoUrl.replace('.git', '').split('/').slice(-2).join('-');
        const clonePath = path.join(__dirname, 'temp_repos', repoName);
        
        if (!fs.existsSync(clonePath)) {
            console.log(`Cloning ${repoUrl}...`);
            const git = simpleGit();
            await git.clone(repoUrl, clonePath);
            console.log("Cloning complete!");
        } else {
            console.log("Repo already exists. Skipping clone.");
        }

        console.log("Processing files...");
        
        const files = getRelevantFiles(clonePath);
        console.log(`Found ${files.length} relevant files. Chunking now...`);
        
        const chunks = await chunkFiles(files);
        console.log(`Created ${chunks.length} chunks. Generating embeddings...`);
        
        await createVectorStore(chunks);

        res.json({ message: 'Repository indexed and ready for chat!' });

    } catch (error) {
        console.error("Error in cloning/indexing:", error);
        res.status(500).json({ error: 'Failed to process repository: ' + error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    // FIX 1: ফ্রন্টএন্ড থেকে query বা message যাই আসুক না কেন, এটা ঠিকঠাক রিসিভ করবে
    const query = req.body.query || req.body.message;

    if (!query) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        console.log(`User asks: ${query}`);
        
        // FIX 2: 'query' ভেরিয়েবলটা এখন প্রপারলি ডিফাইন করা আছে
        const relevantDocs = await searchRelevantCode(query, 5);
        
        const context = relevantDocs.map(doc => `File: ${doc.metadata.filename}\nCode:\n${doc.pageContent}`).join('\n\n');

        // FIX 3: Fallback ফাংশনটাকে ঠিকঠাক কল করা হলো (যাতে Groq ক্র্যাশ না করে)
        const responseText = await getGroqResponseWithFallback(query, context);
        
        res.json({ answer: responseText, sources: relevantDocs.map(d => d.metadata.filename) });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'Failed to generate answer: ' + error.message });
    }
});

 // Anti-Freeze Ping Route
app.get('/ping', (req, res) => res.status(200).send('Codexa Backend is awake '));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});