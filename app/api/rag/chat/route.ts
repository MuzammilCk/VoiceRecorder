import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || !lastMessage.content) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // 1. Generate query embedding
        const embeddingRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: lastMessage.content
        });

        const queryEmbedding = embeddingRes.data[0].embedding;

        // 2. Search similar recordings
        const { data: matches, error: searchError } = await supabase.rpc('match_recordings', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Lowered slightly to ensure some matches if possible
            match_count: 5
        });

        if (searchError) {
            console.error('Vector search error:', searchError);
            // Continue without context if vector search fails, or throw error? 
            // Better to fail gracefully or warn.
        }

        // 3. Build context
        const context = matches
            ?.map((m: any) => `[Recording: ${m.name}]: ${m.transcript}`)
            .join('\n\n') || '';

        console.log(`[RAG] Found ${matches?.length || 0} context matches`);

        // 4. Generate response
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant with access to the user's voice recordings. 
Use the following retrieved context to answer the user's question.

--- CONTEXT START ---
${context}
--- CONTEXT END ---

If the context doesn't contain relevant information to answer the question, say so clearly, but you can still answer general questions if they don't rely on the context.
Prioritize the context for specific facts about recordings.`
                },
                ...messages
            ],
            stream: true
        });

        // 5. Stream response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of completion) {
                    const text = chunk.choices[0]?.delta?.content || '';
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('RAG Chat error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
