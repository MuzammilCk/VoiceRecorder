import OpenAI from 'openai';

export async function POST(req: Request) {
  const { messages, transcript } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `Context: ${transcript}` },
      ...messages
    ]
  });

  return Response.json(response);
}
