import { NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';

export async function POST(request: Request) {
    if (!ASSEMBLYAI_API_KEY) {
        return NextResponse.json({ error: 'AssemblyAI API Key not configured' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log('[API] Uploading file to AssemblyAI...', file.size, file.type);

        // 1. Upload
        const uploadResponse = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': ASSEMBLYAI_API_KEY },
            body: file
        });

        if (!uploadResponse.ok) {
            const err = await uploadResponse.text();
            throw new Error(`Upload failed: ${err}`);
        }

        const uploadData = await uploadResponse.json();
        const audioUrl = uploadData.upload_url;

        // 2. Submit Transcription
        const transcriptResponse = await fetch(`${BASE_URL}/transcript`, {
            method: 'POST',
            headers: {
                'Authorization': ASSEMBLYAI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                speaker_labels: true, // Enable Diarization
                language_code: 'en'  // Default to English for now
            })
        });

        if (!transcriptResponse.ok) {
            const err = await transcriptResponse.text();
            throw new Error(`Transcription submission failed: ${err}`);
        }

        const transcriptData = await transcriptResponse.json();

        return NextResponse.json({ id: transcriptData.id, status: transcriptData.status });

    } catch (error) {
        console.error('[API] Transcription error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function GET(request: Request) {
    if (!ASSEMBLYAI_API_KEY) {
        return NextResponse.json({ error: 'AssemblyAI API Key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(`${BASE_URL}/transcript/${id}`, {
            headers: { 'Authorization': ASSEMBLYAI_API_KEY }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transcript status');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
