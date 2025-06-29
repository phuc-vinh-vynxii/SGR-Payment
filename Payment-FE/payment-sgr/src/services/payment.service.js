import axios from 'axios';

export const sendPayment = async (paymentData) => {
    const res = await axios.post('http://localhost:3000/api/v1/create_payment_url', paymentData);
    return res.data;
};
