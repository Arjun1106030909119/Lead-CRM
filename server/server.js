const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const leadAssignmentRoutes = require('./routes/leadAssignment.routes');
const noteRoutes = require('./routes/note.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const protectedRoutes = require('./routes/protected.routes');
const errorHandler = require('./middleware/errorHandler');
const { PORT } = require('./config');

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leads', leadAssignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api', protectedRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Lead CRM API running' });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
