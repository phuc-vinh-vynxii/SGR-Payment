import qs from "qs";
import crypto from "crypto";
import dotenv from "dotenv";
import { VNPay, ignoreLogger, ProductCode, VnpLocale } from "vnpay";
import moment from "moment";
dotenv.config();

export default class VNPayService {
  static async createQRPayment({ amount, orderInfo, ipAddr }) {
    try {
      if (!amount || amount <= 0) {
        throw new Error("Amount is required and must be greater than 0");
      }

      const vnpay = new VNPay({
        tmnCode: process.env.VNPAY_TMN_CODE,
        secureSecret: process.env.VNPAY_HASH_SECRET,
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: "SHA512",
        loggerFn: ignoreLogger,
      });

      const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr || "127.0.0.1",
        vnp_TxnRef: moment().format("DDHHmmss"),
        vnp_OrderInfo:
          orderInfo || `Thanh toan don hang ${moment().format("DDHHmmss")}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl:
          process.env.VNPAY_RETURN_URL || "http://localhost:3001/vnpay-return",
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      });

      return {
        success: true,
        paymentUrl: vnpayResponse,
        data: {
          amount,
          orderInfo,
          txnRef: moment().format("DDHHmmss"),
        },
      };
    } catch (error) {
      console.error("VNPay QR Payment Error:", error);
      return {
        success: false,
        error: error.message || "Internal server error",
      };
    }
  }

  static buildVNPayUrl({ amount, orderId, ipAddr, bankCode, createDate }) {
    const vnpConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: process.env.VNPAY_URL,
      vnp_Api: process.env.VNPAY_API_URL,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    };
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpConfig.vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang: ${orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
      vnp_ReturnUrl: vnpConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_BankCode: bankCode,
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const signed = crypto
      .createHmac("sha512", vnpConfig.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    sortedParams["vnp_SecureHash"] = signed;
    const paymentUrl = `${vnpConfig.vnp_Url}?${qs.stringify(sortedParams, {
      encode: false,
    })}`;
    return paymentUrl;
  }
  static vnpayReturn(vnp_Params) {
    const vnpConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: process.env.VNPAY_URL,
      vnp_Api: process.env.VNPAY_API_URL,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    };

    const secureHash = vnp_Params["vnp_SecureHash"];

    // Tạo bản sao và xóa các tham số không cần thiết để verify
    const paramsToVerify = { ...vnp_Params };
    delete paramsToVerify["vnp_SecureHash"];
    delete paramsToVerify["vnp_SecureHashType"];

    const sorted = sortObject(paramsToVerify);
    const signData = qs.stringify(sorted, { encode: false });
    const signed = crypto
      .createHmac("sha512", vnpConfig.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash === signed) {
      return {
        success: true,
        code: vnp_Params["vnp_ResponseCode"],
        message: "Checksum OK",
        data: vnp_Params,
      };
    } else {
      return {
        success: false,
        code: "97",
        message: "Checksum Failed",
      };
    }
  }

  static vnpayIPN(vnp_Params) {
    const vnpConfig = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: process.env.VNPAY_URL,
      vnp_Api: process.env.VNPAY_API_URL,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    };

    const secureHash = vnp_Params["vnp_SecureHash"];

    // Tạo bản sao và xóa các tham số không cần thiết để verify
    const paramsToVerify = { ...vnp_Params };
    delete paramsToVerify["vnp_SecureHash"];
    delete paramsToVerify["vnp_SecureHashType"];

    const sorted = sortObject(paramsToVerify);
    const signData = qs.stringify(sorted, { encode: false });
    const signed = crypto
      .createHmac("sha512", vnpConfig.vnp_HashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (secureHash === signed) {
      const rspCode = vnp_Params["vnp_ResponseCode"];
      if (rspCode === "00") {
        // Thành công
        return {
          success: true,
          RspCode: "00",
          Message: "Success",
          data: vnp_Params,
        };
      } else {
        // Thất bại
        return {
          success: false,
          RspCode: "00",
          Message: "Failed transaction",
          data: vnp_Params,
        };
      }
    } else {
      return {
        success: false,
        RspCode: "97",
        Message: "Checksum failed",
      };
    }
  }
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}
