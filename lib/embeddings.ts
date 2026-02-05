/**
 * Triggers server-side embedding generation and storage for a recording.
 */
export async function generateAndStoreEmbedding(recordingId: string, text: string): Promise<void> {
    try {
        const response = await fetch('/api/rag/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordingId, text }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate embedding');
        }
    } catch (error) {
        console.error('Error in RAG embedding service:', error);
        throw error;
    }
}
