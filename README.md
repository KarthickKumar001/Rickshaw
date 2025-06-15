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
<<<<<<< HEAD
- Replace `captainId` in request bodies with actual captain ID 
=======
- Replace `captainId` in request bodies with actual captain ID 
>>>>>>> bbd87feb1f24cfd3fd13c7de5b011d2647f1ea0f

Admin DashBoard

![image](https://github.com/user-attachments/assets/dbcfc769-2b4d-42c5-9d21-9aea3c3f3d4d)

