const express = require('express');
const cors = require('cors');
const companyRoutes =  require('./routes/company.routes');
const authRoutes = require("./routes/auth.routes");

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Enable Cross-Origin Resource Sharing for frontend requests
app.use(cors());

/**
 * Health check endpoint to verify that the API server is running.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'WorkSphere API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/auth', authRoutes);

module.exports = app;
