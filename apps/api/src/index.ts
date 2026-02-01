import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';

import { auth } from './config/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import tasksRoutes from './routes/tasks.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Better Auth handler must be mounted BEFORE express.json()
app.all('/api/auth/*', toNodeHandler(auth));

// express.json() must come after Better Auth handler
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
