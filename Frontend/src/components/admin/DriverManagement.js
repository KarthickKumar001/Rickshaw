import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import axios from '../../utils/axios';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await axios.get('/api/admin/drivers');
            console.log(response);
            setDrivers(response.data.drivers);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleApprove = async (driverId) => {
        try {
            await axios.post(`/api/admin/drivers/${driverId}/approve`);
            fetchDrivers();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleReject = async () => {
        try {
            await axios.post(`/api/admin/drivers/${selectedDriver._id}/reject`, {
                reason: rejectReason
            });
            setRejectDialog(false);
            fetchDrivers();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleViewDetails = (driver) => {
        // console.log("hi muthu!!");
        setSelectedDriver(driver);
        setViewDialog(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3}>
                Driver Management
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Vehicle Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers.map((driver) => (
                            <TableRow key={driver._id}>
                                <TableCell>{driver.name}</TableCell>
                                <TableCell>{driver.email}</TableCell>
                                <TableCell>{driver.phone}</TableCell>
                                <TableCell>{driver.vehicleType}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={driver.status}
                                        color={getStatusColor(driver.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            console.log(driver);
                                         handleViewDetails(driver)
                                        }}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    {driver.status === 'pending' && (
                                        <>
                                            <IconButton
                                                color="success"
                                                onClick={() => handleApprove(driver._id)}
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    setSelectedDriver(driver);
                                                    setRejectDialog(true);
                                                }}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Driver Details Dialog */}
            <Dialog
                open={viewDialog}
                onClose={() => setViewDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Driver Details</DialogTitle>
                <DialogContent>
                    {selectedDriver && (
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Personal Information</Typography>
                                        <Typography>Name: {selectedDriver.name}</Typography>
                                        <Typography>Email: {selectedDriver.email}</Typography>
                                        <Typography>Phone: {selectedDriver.phone}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Vehicle Information</Typography>
                                        <Typography>
                                            Vehicle Type: {selectedDriver.vehicleType}
                                        </Typography>
                                        <Typography>
                                            Vehicle Number: {selectedDriver.vehicleNumber}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                {/* <Card>
                                    <CardContent>
                                        <Typography variant="h6">Documents</Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(selectedDriver.documents).map(
                                                ([type, doc]) => (
                                                    <Grid item xs={12} md={4} key={type}>
                                                        <Typography variant="subtitle1">
                                                            {type}
                                                        </Typography>
                                                        <Typography>
                                                            Status:{' '}
                                                            <Chip
                                                                label={doc.status}
                                                                color={getStatusColor(doc.status)}
                                                                size="small"
                                                            />
                                                        </Typography>
                                                        <Typography>
                                                            Number: {doc.number}
                                                        </Typography>
                                                        <Typography>
                                                            Expiry: {new Date(doc.expiryDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Grid>
                                                )
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card> */}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Reject Driver Dialog */}
            <Dialog
                open={rejectDialog}
                onClose={() => setRejectDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reject Driver</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Rejection Reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRejectDialog(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DriverManagement; 