import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Public routes
import projectsPublic from './routes/public/projects';
import blogPublic from './routes/public/blog';
import pagesPublic from './routes/public/pages';
import settingsPublic from './routes/public/settings';
import contactPublic from './routes/public/contact';
import stripeWebhook from './routes/public/stripeWebhook';
import stripePublic from './routes/public/stripe';
import campaignsPublic from './routes/public/campaigns';

// Admin routes
import authAdmin from './routes/admin/auth';
import projectsAdmin from './routes/admin/projects';
import blogAdmin from './routes/admin/blog';
import pagesAdmin from './routes/admin/pages';
import contactsAdmin from './routes/admin/contacts';
import settingsAdmin from './routes/admin/settings';
import uploadAdmin from './routes/admin/upload';
import stripeAdmin from './routes/admin/stripe';
import campaignsAdmin from './routes/admin/campaigns';

import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// IMPORTANT: Stripe webhook must be mounted BEFORE express.json()
// because it needs the raw body for signature verification
app.use('/api/stripe/webhook', stripeWebhook);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Serve admin panel (React SPA built in admin/dist)
const adminDistPath = path.join(__dirname, '../admin/dist');
app.use('/admin', express.static(adminDistPath));
app.get(['/admin', '/admin/', '/admin/*'], (_req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'));
});

// Public API routes
app.use('/api/projects', projectsPublic);
app.use('/api/blog', blogPublic);
app.use('/api/pages', pagesPublic);
app.use('/api/settings', settingsPublic);
app.use('/api/contact', contactPublic);
app.use('/api/stripe', stripePublic);
app.use('/api/campaigns', campaignsPublic);

// Admin API routes
app.use('/api/admin/auth', authAdmin);
app.use('/api/admin/projects', projectsAdmin);
app.use('/api/admin/blog', blogAdmin);
app.use('/api/admin/pages', pagesAdmin);
app.use('/api/admin/contacts', contactsAdmin);
app.use('/api/admin/settings', settingsAdmin);
app.use('/api/admin/upload', uploadAdmin);
app.use('/api/admin/stripe', stripeAdmin);
app.use('/api/admin/campaigns', campaignsAdmin);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Backend API running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔗 API health: http://localhost:${PORT}/api/health`);
});

export default app;
