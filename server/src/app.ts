import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error'
import authRouter from './features/auth/auth.routes'
import jobsRouter from './features/jobs/jobs.routes'
import candidatesRouter from './features/candidates/candidates.routes'
import sessionsRouter from './features/sessions/sessions.routes'

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'ARIA API' });
});

app.use('/api/auth', authRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/candidates', candidatesRouter)
app.use('/api/sessions', sessionsRouter)

app.use(errorHandler)

export default app;
