const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Confía en el primer proxy delante de la app (load balancer / Cloudflare)
// para que req.ip y express-rate-limit lean X-Forwarded-For correctamente.
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Compresión gzip de respuestas
app.use(compression());

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.CLIENT_URL2, process.env.CLIENT_URL3],
  credentials: true,
}));

// Body parser con límite de tamaño
app.use(express.json({ limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/upload', uploadRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
