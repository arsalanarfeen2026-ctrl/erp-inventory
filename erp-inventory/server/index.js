const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Serve React build in production
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ DB init failed:', err);
  process.exit(1);
});
