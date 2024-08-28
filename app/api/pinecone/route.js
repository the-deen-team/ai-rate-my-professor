import { NextResponse } from 'next/server';
import { PineconeClient } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export async function POST(req) {
  const professorData = await req.json();

  try {
    const client = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = client.Index('your-index-name');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate an embedding for the professor data
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: `${professorData.name} ${professorData.subject} ${professorData.rating}`,
    });

    const vector = embeddingResponse.data[0].embedding;

    await index.upsert({
      vectors: [
        {
          id: professorData.name, // Using professor's name as the unique identifier
          values: vector,
          metadata: { ...professorData },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inserting data into Pinecone:', error);
    return NextResponse.error();
  }
}
