import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'interview-platform';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient;
let cachedDb: Db;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export interface Problem {
  _id?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  hints: string[];
  createdAt: Date;
}

export const saveProblem = async (problem: Omit<Problem, '_id' | 'createdAt'>) => {
  const { db } = await connectToDatabase();
  const result = await db.collection('problems').insertOne({
    ...problem,
    createdAt: new Date(),
  });
  return result.insertedId;
};

export const getProblems = async (filters = {}) => {
  const { db } = await connectToDatabase();
  return db.collection<Problem>('problems').find(filters).sort({ createdAt: -1 }).toArray();
};
