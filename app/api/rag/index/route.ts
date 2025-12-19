import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';

// Helper to get server-side Supabase client (using service role key if available, or anon key)
// Note: For RLS to work properly with anon key, policies must be open.
const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
};

export async function POST(req: Request) {
    try {
        const { recordingId, text } = await req.json();

        if (!recordingId || !text) {
            return NextResponse.json({ error: 'Missing recordingId or text' }, { status: 400 });
        }

        // 1. Generate Embedding
        const embedding = await generateEmbedding(text);

        // 2. Save to Supabase
        const supabase = getSupabase();

        const { error } = await supabase
            .from('recordings')
            .update({ embedding })
            .eq('id', recordingId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Indexing error:', error);
        return NextResponse.json({ error: 'Failed to index recording' }, { status: 500 });
    }
}
