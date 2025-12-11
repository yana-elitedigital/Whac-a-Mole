import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'whacamole';

let cachedClient = null;
let cachedPromise = null;

export async function getMongoClient() {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your environment to enable score persistence.');
  }

  if (cachedClient) {
    return cachedClient;
  }

  if (!cachedPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5
    });
    cachedPromise = client.connect();
  }

  cachedClient = await cachedPromise;
  return cachedClient;
}

export async function getScoreCollection() {
  const mongoClient = await getMongoClient();
  return mongoClient.db(dbName).collection('scores');
}
