# Rickshaw Backend

Backend service for the Rickshaw ride-sharing application.

## Project Structure

```
Backend/
├── index.js                 # Main application file
├── server.config.js         # Server configuration
├── socket.service.js        # Socket.io service
├── package.json            # Project dependencies
├── .env                    # Environment variables
├── controllers/            # Route controllers
├── models/                 # Database models
├── routes/                 # API routes
├── services/              # Business logic
├── middleware/            # Custom middleware
├── validators/            # Request validators
└── db/                    # Database configuration
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/user` - Register new user
- `POST /api/auth/register/captain` - Register new captain
- `POST /api/auth/login/user` - User login
- `POST /api/auth/login/captain` - Captain login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout

### Rides
- `POST /api/rides/calculate-fare` - Calculate ride fare
- `POST /api/rides` - Create new ride
- `GET /api/rides/:rideId/negotiations` - Get sorted negotiations
- `POST /api/rides/:rideId/accept-captain` - Accept captain's request
- `POST /api/rides/:rideId/reject-all` - Reject all negotiations
- `POST /api/rides/:rideId/price-adjustment` - Request price adjustment
- `POST /api/rides/:rideId/confirm` - Confirm ride
- `POST /api/rides/:rideId/start` - Start ride
- `POST /api/rides/:rideId/end` - End ride

## Socket Events

### User Events
- `update-location` - Update user location
- `ride-status-update` - Update ride status

### Captain Events
- `update-captain-location` - Update captain location
- `price-negotiation` - Handle price negotiations

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production

```bash
# Start production server
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rickshaw
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SOCKET_CORS_ORIGIN=http://localhost:3000
```

# Rickshaw API Documentation

This document provides information about the available API endpoints for the Rickshaw application.

## Base URL
```
http://localhost:3000/api
```

## Ride Management

### Create a New Ride
```http
POST /rides
Content-Type: application/json

{
    "pickup": "Connaught Place, New Delhi",
    "destination": "India Gate, New Delhi",
    "vehicleType": "auto"
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "user": "65f2e8b7c261e6001234abce",
        "pickup": "Connaught Place, New Delhi",
        "destination": "India Gate, New Delhi",
        "vehicleType": "auto",
        "fare": 50,
        "status": "pending",
        "activeNegotiations": [],
        "priceNegotiationHistory": [],
        "createdAt": "2024-03-14T10:30:00.000Z",
        "updatedAt": "2024-03-14T10:30:00.000Z"
    }
}
```

### Request Price Adjustment
```http
POST /rides/{rideId}/price-adjustment
Content-Type: application/json

{
    "requestedAmount": 75
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "status": "price_negotiation",
        "activeNegotiations": [
            {
                "captain": "65f2e8b7c261e6001234abcf",
                "requestedAmount": 75,
                "status": "pending",
                "timestamp": "2024-03-14T10:31:00.000Z"
            }
        ]
    }
}
```

### Accept Captain's Request
```http
POST /rides/{rideId}/accept-captain
Content-Type: application/json

{
    "captainId": "65f2e8b7c261e6001234abcf"
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "status": "accepted",
        "fare": 75,
        "captain": "65f2e8b7c261e6001234abcf"
    }
}
```

### Reject All Negotiations
```http
POST /rides/{rideId}/reject-all
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "status": "pending",
        "activeNegotiations": []
    }
}
```

### Start Ride
```http
POST /rides/{rideId}/start
Content-Type: application/json

{
    "captainId": "65f2e8b7c261e6001234abcf"
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "status": "in_progress",
        "startTime": "2024-03-14T10:35:00.000Z"
    }
}
```

### End Ride
```http
POST /rides/{rideId}/end
Content-Type: application/json

{
    "captainId": "65f2e8b7c261e6001234abcf"
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "_id": "65f2e8b7c261e6001234abcd",
        "status": "completed",
        "endTime": "2024-03-14T10:45:00.000Z"
    }
}
```

## Error Responses

### Invalid Ride ID
```json
{
    "status": "error",
    "message": "Invalid ride ID format"
}
```

### Ride Not Found
```json
{
    "status": "error",
    "message": "Ride not found"
}
```

### Unauthorized Captain
```json
{
    "status": "error",
    "message": "You are not assigned to this ride"
}
```

### Invalid State Transition
```json
{
    "status": "error",
    "message": "Cannot start/end ride in current state"
}
```

## Ride Status Flow
1. `pending` - Initial state when ride is created
2. `price_negotiation` - When captain requests price adjustment
3. `accepted` - When user accepts captain's request
4. `in_progress` - When ride starts
5. `completed` - When ride ends

## Testing
For testing purposes, set the environment variable:
```
USE_MOCK_SERVICES=true
```

## Notes
- All timestamps are in ISO 8601 format
- All IDs are MongoDB ObjectIds
- Content-Type header must be set to `application/json` for POST requests
- Replace `{rideId}` in URLs with actual ride ID
- Replace `captainId` in request bodies with actual captain ID 

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
