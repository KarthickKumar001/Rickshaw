const socketIO = require('socket.io');
const userModel = require('./application/models/user.model');
const captainModel = require('./application/models/captain.model');

let io;

/**
 * Initialize socket.io service
 * @param {Object} server - HTTP server instance
 */
function initialize(server) {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Handle user location updates
        socket.on('update-location', (data) => {
            // Broadcast location to relevant clients
            socket.broadcast.emit('location-updated', {
                userId: data.userId,
                location: data.location
            });
        });

        // Handle captain location updates
        socket.on('update-captain-location', (data) => {
            // Broadcast captain location to relevant clients
            socket.broadcast.emit('captain-location-updated', {
                captainId: data.captainId,
                location: data.location
            });
        });

        // Handle ride status updates
        socket.on('ride-status-update', (data) => {
            // Broadcast ride status to relevant clients
            socket.broadcast.emit('ride-status-changed', {
                rideId: data.rideId,
                status: data.status
            });
        });

        // Handle price negotiation updates
        socket.on('price-negotiation', (data) => {
            // Broadcast price negotiation to relevant clients
            socket.broadcast.emit('price-negotiation-update', {
                rideId: data.rideId,
                captainId: data.captainId,
                requestedAmount: data.requestedAmount
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

/**
 * Send message to specific socket
 * @param {string} socketId - Target socket ID
 * @param {Object} message - Message to send
 */
function sendMessageToSocketId(socketId, message) {
    if (io && socketId) {
        io.to(socketId).emit('message', message);
    }
}

/**
 * Broadcast message to all connected clients
 * @param {Object} message - Message to broadcast
 */
function broadcastMessage(message) {
    if (io) {
        io.emit('broadcast', message);
    }
}

module.exports = {
    initialize,
    sendMessageToSocketId,
    broadcastMessage
};