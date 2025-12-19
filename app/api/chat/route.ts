import { openai, SYSTEM_PROMPT } from '@/lib/llm';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(req: Request) {
    try {
        const checkApiKey = process.env.OPENAI_API_KEY;
        if (!checkApiKey) {
            return new Response('Missing OPENAI_API_KEY', { status: 500 });
        }

        const { messages, transcript } = await req.json();

        // Contextualize the chat with the transcript
        // We prepend the system prompt and the transcript context to the messages
        const contextSystemMessage = {
            role: 'system',
            content: `${SYSTEM_PROMPT}\n\nRunning Transcript:\n"${transcript}"`
        };

        // Filter out previous system messages to avoid duplication if the client sends them, 
        // though usually client only sends user/assistant.
        const validMessages = messages.filter((m: any) => m.role !== 'system');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [contextSystemMessage, ...validMessages],
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response as any);

        // Respond with the stream
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
