import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI!;

async function bootstrap() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`ARIA API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});