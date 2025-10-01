export const processInChunks = async <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    chunkSize: number,
    delay: number,
    maxChunks?: number
): Promise<R[]> => {
    const results: R[] = [];
    let chunkCount = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
        if (maxChunks && chunkCount >= maxChunks) {
            console.log(`[Chunk Processing] Reached max chunk limit of ${maxChunks}. Stopping further processing.`);
            break;
        }

        const chunk = items.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(processor);
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        chunkCount++;

        if (i + chunkSize < items.length) {
            console.log(`  -> Processed chunk ${chunkCount}. Waiting ${delay / 1000}s before next chunk.`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    console.log(`[Chunk Processing] Finished processing ${chunkCount} chunks.`);
    return results;
};
