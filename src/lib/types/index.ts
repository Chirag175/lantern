export interface SemanticScholarAuthor {
    authorId: string;
    name: string;
}

export interface SemanticScholarPaper {
    paperId: string;
    title: string;
    authors: SemanticScholarAuthor[];
    year: number | null;
    citationCount: number;
    abstract: string | null;
    // We'll map this on the frontend since the API doesn't provide it
    insights?: string[];
}

export interface SemanticScholarSearchResponse {
    total: number;
    offset: number;
    next?: number;
    data: SemanticScholarPaper[];
}
