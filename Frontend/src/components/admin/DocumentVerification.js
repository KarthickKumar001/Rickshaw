import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress
} from '@mui/material';
import axios from '../../utils/axios';

const DocumentVerification = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('/admin/documents/pending');
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (document) => {
        setSelectedDoc(document);
        setOpenDialog(true);
    };

    const handleVerify = async () => {
        try {
            await axios.post(`/admin/documents/${selectedDoc._id}/verify`, {
                status: 'verified'
            });
            setOpenDialog(false);
            fetchDocuments();
        } catch (error) {
            console.error('Error verifying document:', error);
        }
    };

    const handleReject = async () => {
        try {
            await axios.post(`/admin/documents/${selectedDoc._id}/verify`, {
                status: 'rejected',
                reason: rejectionReason
            });
            setOpenDialog(false);
            setRejectionReason('');
            fetchDocuments();
        } catch (error) {
            console.error('Error rejecting document:', error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Document Verification
            </Typography>
            <Grid container spacing={3}>
                {documents.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {doc.documentType}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    Driver: {doc.driver.name}
                                </Typography>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={doc.documentUrl}
                                    alt={doc.documentType}
                                    sx={{ objectFit: 'contain' }}
                                />
                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleViewDocument(doc)}
                                    >
                                        Review Document
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Review Document</DialogTitle>
                <DialogContent>
                    {selectedDoc && (
                        <>
                            <Box mb={2}>
                                <Typography variant="h6" gutterBottom>
                                    {selectedDoc.documentType}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    Driver: {selectedDoc.driver.name}
                                </Typography>
                            </Box>
                            <CardMedia
                                component="img"
                                height="400"
                                image={selectedDoc.documentUrl}
                                alt={selectedDoc.documentType}
                                sx={{ objectFit: 'contain' }}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Verification Status</InputLabel>
                                <Select
                                    value={verificationStatus}
                                    onChange={(e) => setVerificationStatus(e.target.value)}
                                >
                                    <MenuItem value="verified">Verified</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                            {verificationStatus === 'rejected' && (
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Rejection Reason"
                                    multiline
                                    rows={4}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    {verificationStatus === 'verified' ? (
                        <Button onClick={handleVerify} color="primary">
                            Verify
                        </Button>
                    ) : (
                        <Button
                            onClick={handleReject}
                            color="error"
                            disabled={!rejectionReason}
                        >
                            Reject
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentVerification; 