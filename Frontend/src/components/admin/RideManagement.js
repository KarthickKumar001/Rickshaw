import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../../utils/axios';

const RideManagement = () => {
    const [allRides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const response = await axios.get('/api/admin/rides');
            console.log(response);
            setRides(response.data.rides);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };


    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3}>
                Ride Details
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User Name</TableCell>
                            <TableCell>Driver Name</TableCell>
                            <TableCell>Pickup</TableCell>
                            <TableCell>Drop</TableCell>
                            <TableCell>Vehicle Type</TableCell>
                            <TableCell>Fare</TableCell>
                            <TableCell>Start time</TableCell>
                            <TableCell>End time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allRides.map((ride) => (
                            <TableRow key={ride._id}>
                                <TableCell>{ride.user?.name || 'N/A'}</TableCell>
                                <TableCell>{ride.captain?.name || 'N/A'}</TableCell>
                                <TableCell>{ride.pickup}</TableCell>
                                <TableCell>{ride.destination}</TableCell> {/* Changed from ride.drop */}
                                <TableCell>{ride.vehicleType}</TableCell>
                                <TableCell>₹{ride.fare}</TableCell>
                                <TableCell>{ride.startTime || 'N/A'}</TableCell>
                                <TableCell>{ride.endTime || 'N/A'}</TableCell>
                            </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RideManagement; 