import { GoogleGenerativeAI } from '@google/generative-ai';
import { PaperSummary } from '../types';

export async function summarizePaper(title: string, abstract: string): Promise<PaperSummary> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: {
            role: 'system',
            parts: [
                {
                    text: `You are an expert AI academic research assistant. 
Your task is to analyze the provided research paper title and abstract.
You must return your analysis strictly as a JSON object matching the following structure exactly:
{
  "key_insights": [ "Bullet point 1", "Bullet point 2", "Bullet point 3" ],
  "abstract_analysis": "A single, clear paragraph simplifying and explaining the core meaning of the abstract."
}
Do not use markdown blocks for the JSON (e.g., no \`\`\`json). Just return the raw JSON string.`
                }
            ]
        },
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    const prompt = `Title: ${title}\n\nAbstract: ${abstract}`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText) as PaperSummary;
    } catch (error) {
        console.error('Error in Gemini API summarization:', error);
        throw new Error('Failed to generate summary from Gemini AI.');
    }
}
