import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class PaymentService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.axiosInstance = axios.create({
            baseURL: API_URL,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Initialize Razorpay payment for a ride
     * @param {string} rideId - The ID of the ride
     * @param {Object} userDetails - User details for prefill
     * @returns {Promise} - Returns a promise that resolves when payment is completed
     */
    async initiatePayment(rideId, userDetails) {
        try {
            // 1. Create payment order
            const orderResponse = await this.axiosInstance.post(`/payments/create/${rideId}`);
            const orderData = orderResponse.data;

            // 2. Initialize Razorpay
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,
                name: "RickShaw",
                description: "Ride Payment",
                handler: (response) => this.handlePaymentSuccess(response, rideId),
                prefill: {
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: () => this.handlePaymentDismiss()
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

            return new Promise((resolve, reject) => {
                this.paymentPromise = { resolve, reject };
            });
        } catch (error) {
            console.error('Payment initiation failed:', error);
            throw new Error(error.response?.data?.message || 'Payment initiation failed');
        }
    }

    /**
     * Handle successful payment
     * @param {Object} response - Razorpay payment response
     * @param {string} rideId - The ID of the ride
     */
    async handlePaymentSuccess(response, rideId) {
        try {
            // 1. Verify payment
            const verifyResponse = await this.verifyPayment(response, rideId);
            
            // 2. Check payment status
            const statusResponse = await this.checkPaymentStatus(rideId);
            
            if (this.paymentPromise) {
                this.paymentPromise.resolve({
                    verification: verifyResponse,
                    status: statusResponse
                });
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            if (this.paymentPromise) {
                this.paymentPromise.reject(error);
            }
        }
    }

    /**
     * Handle payment modal dismiss
     */
    handlePaymentDismiss() {
        if (this.paymentPromise) {
            this.paymentPromise.reject(new Error('Payment cancelled by user'));
        }
    }

    /**
     * Verify payment with backend
     * @param {Object} razorpayResponse - Response from Razorpay
     * @param {string} rideId - The ID of the ride
     */
    async verifyPayment(razorpayResponse, rideId) {
        try {
            const response = await this.axiosInstance.post('/payments/verify', {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                rideId: rideId
            });
            return response.data;
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw new Error(error.response?.data?.message || 'Payment verification failed');
        }
    }

    /**
     * Check payment status
     * @param {string} rideId - The ID of the ride
     */
    async checkPaymentStatus(rideId) {
        try {
            const response = await this.axiosInstance.get(`/payments/status/${rideId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch payment status:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch payment status');
        }
    }
}

// Example usage in a React component:
/*
import PaymentService from '../services/payment.service';

const PaymentComponent = () => {
    const handlePayment = async () => {
        try {
            const paymentService = new PaymentService();
            const userDetails = {
                name: "John Doe",
                email: "john@example.com",
                phone: "9999999999"
            };
            
            const result = await paymentService.initiatePayment('ride_id_here', userDetails);
            console.log('Payment successful:', result);
            
            // Handle successful payment
            // e.g., show success message, update UI, etc.
        } catch (error) {
            console.error('Payment failed:', error);
            // Handle payment failure
            // e.g., show error message, retry option, etc.
        }
    };

    return (
        <button onClick={handlePayment}>
            Pay Now
        </button>
    );
};
*/

export default PaymentService; 