export default class PaymentService {
    static async processPayment(paymentData) {
        //logic
        return {
            success: true,
            transactionId: `TXN-${Date.now()}`,
            received: paymentData,
        }
    }
}