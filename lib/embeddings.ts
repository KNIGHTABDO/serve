let extractor: any = null;
let loadFailed = false;

/**
 * Initialize the embedding model (Xenova/all-MiniLM-L6-v2 is small and fast)
 * 
 * KNOWN ISSUE: @xenova/transformers crashes under Turbopack (Next.js 16)
 * due to ONNX runtime calling Object.keys on undefined during module evaluation.
 * We gracefully degrade — embeddings are disabled if the import fails,
 * but the rest of the app continues working perfectly.
 */
async function getExtractor() {
    if (loadFailed) return null;
    if (extractor) return extractor;

    try {
        // Polyfill process for ONNX runtime
        if (typeof window !== 'undefined') {
            const w = window as any;
            if (!w.process) w.process = { env: {}, versions: {}, platform: '', argv: [] };
            if (!w.process.env) w.process.env = {};
            if (!w.process.versions) w.process.versions = {};
        }

        const transformers = await import('@xenova/transformers');
        const env = transformers.env;
        env.allowLocalModels = false;

        extractor = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        return extractor;
    } catch (e) {
        console.warn('[SERVE] Embeddings unavailable (Turbopack/ONNX incompatibility). Semantic search disabled.', e);
        loadFailed = true;
        return null;
    }
}

/**
 * Generate a vector embedding for a string of text.
 * Returns null if embeddings are unavailable.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const extract = await getExtractor();
        if (!extract) return null;
        const output = await extract(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (e) {
        console.warn('[SERVE] Embedding generation failed:', e);
        return null;
    }
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
