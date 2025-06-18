require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const authRoutes = require('./application/routes/auth.routes');
const rideRoutes = require('./application/routes/ride.routes');
const paymentRoutes = require('./application/routes/payment.routes');
const vaultRoutes = require('./application/routes/vault.routes');
const adminRoutes = require('./admin/routes/admin.routes');
const userRoutes = require('./application/routes/user.routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [process.env.CLIENT_URL, 'http://localhost:3001', 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rickshaw')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});