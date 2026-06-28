import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Configuration for directories and files to exclude
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage'];
const IGNORE_FILES = ['package-lock.json', 'package.json', 'yarn.lock', '.gitignore', 'README.md'];
const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json'];


export const getRelevantFiles = (dirPath, arrayOfFiles = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                getRelevantFiles(fullPath, arrayOfFiles);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            
            // Check if the file or its extension is in the ignore list
            if (!IGNORE_FILES.includes(file) && !IGNORE_EXTENSIONS.includes(ext)) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
};

/**
 * Reads the allowed files and splits their content into chunks for vector processing.
 */
export const chunkFiles = async (filePaths) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000, 
        chunkOverlap: 200, 
    });

    let allChunks = [];

    for (const filePath of filePaths) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const chunks = await splitter.createDocuments(
            [content],
            [{ source: filePath, filename: path.basename(filePath) }]
        );
        allChunks.push(...chunks);
    }

    return allChunks;
};