import VNPayService from "../services/vnpay.service.js";
import moment from "moment";

export default class PaymentController {
  static createPayment = (req, res) => {
    const { amount, bankCode } = req.body;
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();
    console.log(typeof amount, typeof bankCode);
    const ipAddr =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const orderId = moment(date).format("DDHHmmss");

    const vnpUrl = VNPayService.buildVNPayUrl({
      amount,
      orderId,
      ipAddr,
      bankCode,
      createDate,
    });

    res.status(200).json({ paymentUrl: vnpUrl });
  };

  static vnpayReturn = (req, res) => {
    try {
      const vnp_Params = { ...req.query };
      const result = VNPayService.vnpayReturn(vnp_Params);

      return res.json({
        code: result.code,
        message: result.message,
      });
    } catch (error) {
      console.error("VNPay return error:", error);
      return res.status(500).json({
        code: "99",
        message: "Internal server error",
      });
    }
  };

  static vnpayIPN = (req, res) => {
    try {
      const vnp_Params = { ...req.query };
      const result = VNPayService.vnpayIPN(vnp_Params);

      return res.status(200).json({
        RspCode: result.RspCode,
        Message: result.Message,
      });
    } catch (error) {
      console.error("VNPay IPN error:", error);
      return res.status(200).json({
        RspCode: "99",
        Message: "Internal server error",
      });
    }
  };

  static createQR = async (req, res) => {
    try {
      const { amount, orderInfo } = req.body;
      const ipAddr =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;

      const result = await VNPayService.createQRPayment({
        amount,
        orderInfo,
        ipAddr,
      });

      if (result.success) {
        return res.status(201).json({
          paymentUrl: result.paymentUrl,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Create QR Controller Error:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
}

// const defaultOrderInfo = {
//   amount: 10000, // VNĐ
//   bankCode: "NCB", // ngân hàng mặc định
//   locale: "vn", // ngôn ngữ
//   orderType: "other", // loại đơn hàng
//   currency: "VND", // đơn vị tiền
// };
