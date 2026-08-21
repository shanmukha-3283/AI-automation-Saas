import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { randomUUID } from 'crypto';
import 'dotenv/config';
// Initialize Qdrant Client using env variables
const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
export const qdrantClient = new QdrantClient({ url: qdrantUrl });
const COLLECTION_NAME = 'client_faqs';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const VECTOR_SIZE = 1536; // Size for text-embedding-3-small
// Initialize OpenAI Embeddings
const embeddings = new OpenAIEmbeddings({
    modelName: EMBEDDING_MODEL,
});
/**
 * Ensures the Qdrant collection exists and has the correct vector size.
 */
export async function ensureCollectionExists() {
    try {
        const collections = await qdrantClient.getCollections();
        const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
        if (!exists) {
            console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine',
                },
            });
            console.log(`Collection ${COLLECTION_NAME} created successfully.`);
        }
        else {
            console.log(`Collection ${COLLECTION_NAME} already exists.`);
        }
    }
    catch (error) {
        console.error('Error ensuring Qdrant collection exists:', error);
        throw error;
    }
}
/**
 * Ingests a single FAQ into Qdrant by generating an embedding for the question.
 */
export async function ingestFAQ(question, answer) {
    try {
        // Generate embedding for the question
        const vector = await embeddings.embedQuery(question);
        // Upsert into Qdrant
        await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id: randomUUID(),
                    vector,
                    payload: {
                        question,
                        answer,
                        type: 'faq'
                    },
                },
            ],
        });
        return true;
    }
    catch (error) {
        console.error('Error ingesting FAQ:', error);
        return false;
    }
}
/**
 * Searches the FAQ collection using a user query.
 */
export async function searchFAQ(query, limit = 3) {
    try {
        const queryVector = await embeddings.embedQuery(query);
        const searchResults = await qdrantClient.query(COLLECTION_NAME, {
            query: queryVector,
            limit,
            with_payload: true,
        });
        // Map results to extract payload neatly
        return searchResults.points.map((result) => ({
            score: result.score,
            question: result.payload?.question,
            answer: result.payload?.answer,
        }));
    }
    catch (error) {
        console.error('Error searching FAQs:', error);
        return [];
    }
}
