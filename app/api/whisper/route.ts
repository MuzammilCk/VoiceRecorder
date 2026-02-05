import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Whisper API] Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const language = formData.get('language')?.toString();

    // Validation
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    // Optional: Check file size (e.g., limit to 25MB which is Whisper's limit)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 413 });
    }

    const openai = new OpenAI({ apiKey });

    // Note: openai-node expects a File object (which Blob from formData is close enough to in recent environments)
    // or a ReadStream. If passing a Blob directly fails in some Next.js environments, 
    // we might need to cast or convert buffer. 
    // However, recent OpenAI SDK versions handle this well.

    console.log('[Whisper API] Transcribing...', { size: file.size, type: file.type, language });

    const transcription = await openai.audio.transcriptions.create({
      file: file as File,
      model: 'whisper-1',
      language: language || undefined,
      response_format: 'json'
    });

    return NextResponse.json(transcription);

  } catch (error: any) {
    console.error('[Whisper API] Error:', error);

    // Handle specific OpenAI errors
    if (error?.response) {
      const status = error.response.status || 500;
      return NextResponse.json({ error: `OpenAI Error: ${error.message}` }, { status });
    }

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
