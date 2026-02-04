import OpenAI from 'openai';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const language = formData.get('language')?.toString();

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: language || undefined,
    response_format: 'json'
  });

  return Response.json(transcription);
}
