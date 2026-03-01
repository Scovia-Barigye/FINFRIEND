require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require('./routes/modules');
const dashboardRoutes = require('./routes/dashboard');
const forumRoutes = require('./routes/forum');
const blogRoutes = require('./routes/blog');
const badgeRoutes = require('./routes/badges');
const toolRoutes = require('./routes/tools');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/tools', toolRoutes);

// --------------- Page Routes ---------------
const pageMap = {
  '/': 'index',
  '/login': 'login',
  '/register': 'register',
  '/dashboard': 'dashboard',
  '/modules': 'modules',
  '/module': 'module',
  '/tools': 'tools',
  '/forum': 'forum',
  '/forum/thread': 'forum-thread',
  '/blog': 'blog',
  '/blog/post': 'blog-post',
  '/leaderboard': 'leaderboard',
  '/profile': 'profile',
  '/about': 'about'
};
Object.entries(pageMap).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${file}.html`), err => {
      if (err) res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 FinFriend running at http://localhost:${PORT}`);
});
