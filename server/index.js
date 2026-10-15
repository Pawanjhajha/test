require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

// Cached connection so serverless invocations reuse it
let connection;
const connectDB = () => (connection ??= mongoose.connect(process.env.MONGO_URI));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    connection = undefined;
    res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/users', require('./routes/users'));

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
