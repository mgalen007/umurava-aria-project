import 'dotenv/config';
import mongoose from 'mongoose';
import { Candidate } from '../features/candidates/candidates.model';

async function run() {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri);

  const indexes = await Candidate.collection.indexes();
  const legacyEmailIndex = indexes.find(
    (index) => index.name === 'email_1' && index.unique === true
  );

  const legacyEmailIndexName = legacyEmailIndex?.name;

  if (legacyEmailIndexName) {
    await Candidate.collection.dropIndex(legacyEmailIndexName);
    console.log(`Dropped legacy index: ${legacyEmailIndexName}`);
  } else {
    console.log('Legacy email index not found, skipping drop.');
  }

  await Candidate.syncIndexes();
  console.log('Candidate indexes are now in sync.');
}

run()
  .catch((error) => {
    console.error('Candidate index migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
