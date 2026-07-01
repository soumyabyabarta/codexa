<h1 align="center"> Codexa AI 🤖 </h1>

<p align="center">
  <a href="https://codexa-backend-i1jc.onrender.com">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&pause=1000&color=F97316&center=true&vCenter=true&width=500&lines=Chat+with+any+GitHub+repository.;Understand+complex+architecture.;Say+goodbye+to+endless+reading." alt="Typing SVG" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AI-Powered-F97316?style=for-the-badge" alt="AI" />
</p>

## 🤖 The Why ??
Ever cloned a massive GitHub repository and felt completely lost trying to figure out where to start? I definitely have. 

I built **Codexa AI** to solve that exact problem. It’s an intelligent code-assistant built on a RAG (Retrieval-Augmented Generation) architecture. You just paste a GitHub URL, and the app clones the repo, reads the files, and creates a vector database. Then, you can simply "chat" with the codebase in plain English to find bugs, understand the architecture, or explain complex logic.

## ✨ Features
- ⚡ **Instant Indexing:** Securely clones and processes repositories in a containerized backend.
- 🧠 **Context-Aware AI:** Actually reads the code to answer questions, preventing AI hallucinations.
- 🔄 **Smart LLM Fallback:** If the primary AI API (Groq) hits a rate limit, the system automatically switches to a backup (Mistral/Gemini) so you never experience downtime.
- 🛡️ **Bulletproof Inputs:** Auto-sanitizes URLs to ensure accidental trailing spaces don't cause server-side protocol crashes.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, `simple-git`
- **AI & Data:** Groq, Mistral, Gemini APIs, Vector Embeddings
- **DevOps/Hosting:** Docker, Render, Netlify

## 🚀 Getting Started (Local Setup)

Want to run this locally? It's super easy.

**1. Clone the repo:**
```bash
git clone https://github.com/soumyabyabarta/codexa.git
cd codexa
```

**2. Setup the Backend:**
```bash
cd server
npm install
```
Create a .env file in the /server directory and add your AI API keys:
```bash
PORT=5000
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```
Run the backend: npm start


**3. Setup the Frontend:**
Open a new terminal window 
```bash
cd client
npm install
npm run dev
```

## 🏗️ Production-Ready Architecture
This isn't just a local weekend project; it's built for the cloud.

Dockerized Git Environment: Because standard cloud containers (like Render/Railway) don't always have Git pre-installed, I wrote a custom Dockerfile using a lightweight Linux image to ensure simple-git never throws ENOENT errors in production.

Cost-Optimized Server Sleeping: To bypass cloud cold-starts without spending money, I engineered a custom Linux cron-schedule (*/10 0,10-11,16-23 * * *) that pings the server strictly during active hours, preserving free-tier limits while keeping the app incredibly fast for users.

Made with ❤️ 
