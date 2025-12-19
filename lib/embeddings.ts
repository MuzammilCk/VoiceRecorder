import { openai } from './llm';

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // Remove newlines to avoid embedding artifacts
        const cleanText = text.replace(/\n/g, ' ');

        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: cleanText,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}
