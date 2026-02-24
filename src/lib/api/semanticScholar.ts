import { SemanticScholarSearchResponse, SemanticScholarPaper } from '../types';

const API_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export async function searchPapers(query: string, limit: number = 10): Promise<SemanticScholarPaper[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,citationCount,abstract`
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            }
            throw new Error(`Semantic Scholar API error: ${response.status}`);
        }

        const data: SemanticScholarSearchResponse = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching papers from Semantic Scholar:', error);
        throw error;
    }
}
