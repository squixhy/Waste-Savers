require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors(
    {
      origin: '*'
    }
));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const alertsRoute = require('./routes/alerts');
app.use('/alerts', alertsRoute);




const PORT = 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});