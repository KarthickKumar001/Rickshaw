import {
    Cancel as CancelIcon,
    DirectionsCar as CarIcon,
    CheckCircle as CheckIcon,
    Description as DocumentIcon,
    LocalTaxi as DriverIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
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
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import logger from '../../utils/logger';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard');
            logger.info("fecthing daahsboard details");
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    const StatCard = ({ title, value, icon, color }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="h6" ml={1}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3}>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<PeopleIcon color="primary" />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Drivers"
                        value={stats.totalDrivers}
                        icon={<DriverIcon color="secondary" />}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Rides"
                        value={stats.activeRides}
                        icon={<CarIcon color="success" />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue.toFixed(2)}`}
                        icon={<MoneyIcon color="warning" />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper>
                        <Box p={2}>
                            <Typography variant="h6" mb={2}>
                                Pending Document Verifications
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DocumentIcon />}
                                onClick={() => navigate('/admin/documents')}
                            >
                                View All Documents
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper>
                        <Box p={2}>
                            <Typography variant="h6" mb={2}>
                                Recent Activities
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Driver Registration</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Pending"
                                                    color="warning"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="success"
                                                    size="small"
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 