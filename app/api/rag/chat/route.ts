import { openai } from '@/lib/llm';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { generateEmbedding } from '@/lib/embeddings';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
};

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Get the last user message to use as the search query
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content;

        // 1. Generate Embedding for the query
        const embedding = await generateEmbedding(query);

        // 2. Search Supabase for similar recordings
        const supabase = getSupabase();
        const { data: chunks, error } = await supabase.rpc('match_recordings', {
            query_embedding: embedding,
            match_threshold: 0.5, // adjust this threshold
            match_count: 5 // number of chunks to retrieve
        });

        if (error) {
            console.error('Supabase search error:', error);
            throw error;
        }

        // 3. Construct the RAG prompt
        const context = chunks
            .map((chunk: any) => `Recording: "${chunk.name}"\nTranscript: ${chunk.transcript}`)
            .join('\n\n');

        const systemPrompt = `You are a helpful Voice Note Assistant. 
    You have access to the user's past recordings. 
    Use the following pieces of retrieved context to answer the user's question. 
    If the context doesn't contain the answer, say "I couldn't find that information in your recordings."
    
    Context:
    ${context}
    `;

        // 4. Update the system message in the chat history
        // We replace the previous system prompt (if any) or add a new one
        const contextSystemMessage = {
            role: 'system',
            content: systemPrompt
        };

        // Filter out existing system messages to avoid confusion
        const userMessages = messages.filter((m: any) => m.role !== 'system');

        // 5. Generate Response with OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [contextSystemMessage, ...userMessages],
        });

        const stream = OpenAIStream(response as any);
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.error('RAG Chat Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
