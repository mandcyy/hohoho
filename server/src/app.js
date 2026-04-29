require('dotenv').config();
const http = require('http');
const app  = require('./config/express');
const { initSocket } = require('./socket');

const PORT   = process.env.PORT || 4000;
const server = http.createServer(app);
const io     = initSocket(server);

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

server.listen(PORT, () =>
  console.log(`[SERVER] ✅ http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

process.on('SIGTERM', () => server.close(() => process.exit(0)));

// ── Anti-sleep: ping diri sendiri setiap 10 menit biar Render gak tidur ──
if (process.env.NODE_ENV === 'production' && process.env.SERVER_URL) {
  const PING_INTERVAL = 10 * 60 * 1000; // 10 menit
  setInterval(async () => {
    try {
      await fetch(`${process.env.SERVER_URL}/api/health`);
      console.log('[PING] ✅ self-ping ok');
    } catch (e) {
      console.warn('[PING] ⚠️  self-ping gagal:', e.message);
    }
  }, PING_INTERVAL);
  console.log(`[PING] 🔁 self-ping aktif setiap 10 menit → ${process.env.SERVER_URL}/api/health`);
}
