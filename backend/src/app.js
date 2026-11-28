const express = require('express');
const cors = require('cors');
const companyRoutes =  require('./routes/company.routes');
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Enable Cross-Origin Resource Sharing for frontend requests
app.use(cors());

app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/users', userRoutes);

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
app.use('/api/v1/employees', employeeRoutes);

module.exports = app;
