import { Hono } from 'hono';
import { authRouter } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';
import { apiRouter } from './routes/api';
import { filesRouter } from './routes/files';
import { publicRouter } from './routes/public';
import { renderNotFoundPage } from './views/pages/not-found';

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  APP_NAME: string;
  APP_URL: string;
  ENVIRONMENT: string;
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount Sub-routers
app.route('/', authRouter);
app.route('/', dashboardRouter);
app.route('/', apiRouter);
app.route('/', filesRouter);
app.route('/', publicRouter);

// 404 Handler
app.notFound((c) => {
  return c.html(renderNotFoundPage('404 - Not Found', 'The requested page or portfolio does not exist.'), 404);
});

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled Application Error:', err);
  return c.html(
    renderNotFoundPage('Something Went Wrong', 'An unexpected error occurred on the edge server. Please try again shortly.'),
    500
  );
});

export default app;

