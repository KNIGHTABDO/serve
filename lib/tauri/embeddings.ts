import { pipeline } from '@xenova/transformers';

let extractor: any = null;

/**
 * Initialize the embedding model (Xenova/all-MiniLM-L6-v2 is small and fast)
 */
async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

/**
 * Generate a vector embedding for a string of text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/**
 * Calculate cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chunk text into smaller pieces for better embedding granularity.
 */
export function chunkText(text: string, size: number = 500, overlap: number = 50): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        chunks.push(text.slice(start, start + size));
        start += (size - overlap);
    }
    return chunks;
}
