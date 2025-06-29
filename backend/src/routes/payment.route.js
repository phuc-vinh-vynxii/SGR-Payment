import { Router } from "express";
import PaymentController from "../controllers/payment.controller.js";

export default class paymentRoutes {
  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post("/create_payment_url", PaymentController.createPayment);
    this.router.post("/create-qr", PaymentController.createQR);
    this.router.get("/vnpay-return", PaymentController.vnpayReturn);
    this.router.get("/vnpay-ipn", PaymentController.vnpayIPN);
  }
  getRouter() {
    return this.router;
  }
}
