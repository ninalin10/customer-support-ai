import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = 'Your system prompt here'; // Replace with your own system prompt

export async function POST(req) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Access the API key from environment variables
  });

  const data = await req.json();
  
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data],
    model: 'gpt-4', // Make sure to use the correct model identifier
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}