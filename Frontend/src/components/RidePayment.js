import React, { useState } from 'react';
import PaymentButton from './PaymentButton';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const RidePayment = ({ ride }) => {
    const [paymentStatus, setPaymentStatus] = useState(null);

    const handlePaymentSuccess = (result) => {
        setPaymentStatus('success');
        toast.success('Payment successful!');
        // Additional success handling
        console.log('Payment details:', result);
    };

    const handlePaymentError = (error) => {
        setPaymentStatus('error');
        toast.error(`Payment failed: ${error}`);
        // Additional error handling
    };

    return (
        <div className="ride-payment">
            <h2>Complete Your Payment</h2>
            
            <div className="payment-details">
                <div className="detail-row">
                    <span>Ride ID:</span>
                    <span>{ride._id}</span>
                </div>
                <div className="detail-row">
                    <span>From:</span>
                    <span>{ride.pickup}</span>
                </div>
                <div className="detail-row">
                    <span>To:</span>
                    <span>{ride.destination}</span>
                </div>
                <div className="detail-row">
                    <span>Amount:</span>
                    <span>₹{ride.fare}</span>
                </div>
            </div>

            {paymentStatus === 'success' ? (
                <div className="payment-success">
                    <h3>Payment Successful!</h3>
                    <p>Thank you for using RickShaw.</p>
                </div>
            ) : (
                <PaymentButton
                    rideId={ride._id}
                    amount={ride.fare}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            )}
        </div>
    );
};

// Add styles
const styles = `
    .ride-payment {
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .payment-details {
        margin: 20px 0;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .payment-success {
        text-align: center;
        color: #28a745;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 4px;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default RidePayment; 