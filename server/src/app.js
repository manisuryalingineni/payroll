require('dotenv').config();
const express = require('express');
const cors = require('cors');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set');
  process.exit(1);
}

const app = express();

const clean = (u) => (u || '').trim().replace(/\/+$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  clean(process.env.CLIENT_URL),
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow tools like curl/Postman (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    },
  })
);

app.use(express.json());

// Health checks (root also works for uptime pingers)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/payslips', require('./routes/payslips'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));

process.on('uncaughtException', (err) => console.error('UNCAUGHT:', err));
process.on('unhandledRejection', (err) => console.error('UNHANDLED:', err));

app.use('*', (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Central error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));