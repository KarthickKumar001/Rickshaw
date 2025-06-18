import React, { useState } from 'react';
import PaymentService from '../services/payment.service';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an auth context

const PaymentButton = ({ rideId, amount, onPaymentSuccess, onPaymentError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth(); // Get user details from auth context

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const paymentService = new PaymentService();
            
            // Prepare user details for Razorpay
            const userDetails = {
                name: user.name,
                email: user.email,
                phone: user.phone
            };
            
            // Initialize payment
            const result = await paymentService.initiatePayment(rideId, userDetails);
            
            // Handle successful payment
            if (onPaymentSuccess) {
                onPaymentSuccess(result);
            }
        } catch (error) {
            console.error('Payment failed:', error);
            // Handle payment failure
            if (onPaymentError) {
                onPaymentError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={isLoading}
            className="payment-button"
        >
            {isLoading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
    );
};

// Add some basic styles
const styles = `
    .payment-button {
        background-color: #3399cc;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .payment-button:hover {
        background-color: #2980b9;
    }

    .payment-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default PaymentButton; 