import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./vnpayreturn.page.css";

function VNPAYReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const responseCode = query.get("vnp_ResponseCode");
    const orderId = query.get("vnp_TxnRef");
    const amount = query.get("vnp_Amount");
    const orderInfo = query.get("vnp_OrderInfo");
    const transactionNo = query.get("vnp_TransactionNo");
    const payDate = query.get("vnp_PayDate");

    setTimeout(() => {
      if (responseCode === "00") {
        setPaymentResult({
          success: true,
          message: "Thanh toán thành công!",
          thankYouMessage: "Cảm ơn bạn đã mua hàng tại Apple Store!",
          orderId: orderId,
          amount: amount ? parseInt(amount) / 100 : 0,
          orderInfo: orderInfo,
          transactionNo: transactionNo,
          payDate: payDate,
        });
        setShowConfetti(true);
        // Hide confetti after 3 seconds
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setPaymentResult({
          success: false,
          message: "Thanh toán thất bại!",
          description:
            "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
          orderId: orderId,
          responseCode: responseCode,
          orderInfo: orderInfo,
        });
      }
      setLoading(false);
    }, 2000);
  }, [location]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // VNPay date format: yyyyMMddHHmmss
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(8, 10);
    const minute = dateString.slice(10, 12);

    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  const handleBackToShop = () => {
    navigate("/");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="vnpay-return">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Đang xử lý kết quả thanh toán...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vnpay-return">
      {showConfetti && (
        <div className="confetti">
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
        </div>
      )}

      <div className="result-container">
        <div
          className={`result-icon ${
            paymentResult.success ? "success" : "error"
          }`}
        >
          {paymentResult.success ? (
            <div className="success-icon">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          ) : (
            <div className="error-icon">❌</div>
          )}
        </div>

        <h1 className={paymentResult.success ? "success-text" : "error-text"}>
          {paymentResult.message}
        </h1>

        {paymentResult.success && (
          <p className="thank-you-message">{paymentResult.thankYouMessage}</p>
        )}

        {!paymentResult.success && paymentResult.description && (
          <p className="error-description">{paymentResult.description}</p>
        )}

        <div className="payment-details">
          <h3>Chi tiết giao dịch</h3>

          <div className="detail-item">
            <span className="label">
              <span className="icon">📋</span>
              Mã đơn hàng:
            </span>
            <span className="value">{paymentResult.orderId}</span>
          </div>

          {paymentResult.success && paymentResult.amount > 0 && (
            <div className="detail-item">
              <span className="label">
                <span className="icon">💰</span>
                Số tiền:
              </span>
              <span className="value amount">
                {formatCurrency(paymentResult.amount)}
              </span>
            </div>
          )}

          {paymentResult.orderInfo && (
            <div className="detail-item">
              <span className="label">
                <span className="icon">🛍️</span>
                Thông tin đơn hàng:
              </span>
              <span className="value">{paymentResult.orderInfo}</span>
            </div>
          )}

          {paymentResult.success && paymentResult.transactionNo && (
            <div className="detail-item">
              <span className="label">
                <span className="icon">🏦</span>
                Mã giao dịch VNPay:
              </span>
              <span className="value">{paymentResult.transactionNo}</span>
            </div>
          )}

          {paymentResult.success && paymentResult.payDate && (
            <div className="detail-item">
              <span className="label">
                <span className="icon">🕒</span>
                Thời gian thanh toán:
              </span>
              <span className="value">{formatDate(paymentResult.payDate)}</span>
            </div>
          )}

          {!paymentResult.success && paymentResult.responseCode && (
            <div className="detail-item">
              <span className="label">
                <span className="icon">⚠️</span>
                Mã lỗi:
              </span>
              <span className="value error">{paymentResult.responseCode}</span>
            </div>
          )}
        </div>

        <div className="actions">
          {paymentResult.success ? (
            <>
              <button onClick={handleContinueShopping} className="primary-btn">
                🛍️ Tiếp tục mua sắm
              </button>
              <button onClick={() => window.print()} className="secondary-btn">
                🖨️ In hóa đơn
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBackToShop} className="primary-btn">
                🏠 Quay lại cửa hàng
              </button>
              <button
                onClick={() => navigate("/", { state: { retryPayment: true } })}
                className="secondary-btn"
              >
                🔄 Thử lại
              </button>
            </>
          )}
        </div>

        {paymentResult.success && (
          <div className="footer-message">
            <p>🎉 Đơn hàng của bạn đang được xử lý!</p>
            <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VNPAYReturnPage;
