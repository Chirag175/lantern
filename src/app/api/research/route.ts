import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,citationCount,abstract`,
      {
        headers: {
          'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
        return NextResponse.json(
            { error: `Semantic Scholar API error: ${response.status}` },
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Semantic Scholar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
