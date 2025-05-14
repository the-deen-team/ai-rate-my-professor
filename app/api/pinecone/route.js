import { NextResponse } from 'next/server';
import { PineconeClient } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export async function POST(req) {
  const professorData = await req.json();

  try {
    // Initialize Pinecone client
    const client = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Define the index name and desired vector dimensionality
    const indexName = 'your-index-name';
    const expectedDimensions = 1536; // Dimensionality of `text-embedding-ada-002`

    // Check if the index exists
    const existingIndexes = await client.listIndexes();

    if (!existingIndexes.includes(indexName)) {
      // Create the index with the correct dimensions
      await client.createIndex({
        name: indexName,
        dimension: expectedDimensions,
      });

      console.log(`Index ${indexName} created successfully with ${expectedDimensions} dimensions.`);
    }

    // Connect to the index
    const index = client.Index(indexName);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate an embedding for the professor data
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: `${professorData.name} ${professorData.subject} ${professorData.rating}`,
    });

    const vector = embeddingResponse.data[0].embedding;

    // Upsert the vector into the index
    await index.upsert({
      vectors: [
        {
          id: professorData.name, // Using professor's name as the unique identifier
          values: vector,
          metadata: { ...professorData },
        },
      ],
    });

    console.log('Vector successfully upserted into Pinecone.');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Pinecone index or data:', error);
    return NextResponse.error();
  }
}
