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
        const { recordingId, text } = await request.json();

        if (!recordingId || !text) {
            return NextResponse.json({ error: 'Missing recordingId or text' }, { status: 400 });
        }

        // 1. Generate embedding
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.replace(/\n/g, ' ')
        });

        const embedding = response.data[0].embedding;

        // 2. Store in Supabase
        // Note: 'recordings' table must allow update by service role or authenticated user
        const { error } = await supabase
            .from('recordings')
            .update({ embedding })
            .eq('id', recordingId);

        if (error) {
            console.error('Supabase update error:', error);
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Embedding error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
