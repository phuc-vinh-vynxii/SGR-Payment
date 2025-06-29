import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const location = useLocation();

  // Danh sách sản phẩm mẫu
  const [products] = useState([
    { id: 1, name: "iPhone 14", price: 25000000, image: "📱" },
    { id: 2, name: "MacBook Air M2", price: 35000000, image: "💻" },
    { id: 3, name: "AirPods Pro", price: 6000000, image: "🎧" },
    { id: 4, name: "iPad Air", price: 18000000, image: "📟" },
    { id: 5, name: "Apple Watch", price: 12000000, image: "⌚" },
    { id: 6, name: "Magic Mouse", price: 2500000, image: "🖱️" },
  ]);

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Check if user came back from payment
  useEffect(() => {
    if (location.state?.retryPayment) {
      setShowWelcomeBack(true);
      setTimeout(() => setShowWelcomeBack(false), 5000);
    }
  }, [location]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Cập nhật số lượng
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Tính tổng tiền
  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Format tiền VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    setLoading(true);
    try {
      const totalAmount = getTotalAmount();
      const orderInfo = `Thanh toan ${cart.length} san pham - ${formatCurrency(
        totalAmount
      )}`;

      const response = await axios.post("/api/v1/create-qr", {
        amount: totalAmount,
        orderInfo: orderInfo,
      });

      // Chuyển hướng đến VNPay
      console.log("Response:", response.data); // Debug log
      const paymentUrl =
        response.data.paymentUrl || response.data.vnpUrl || response.data.url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Payment URL not found in response");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shopping-cart">
      {showWelcomeBack && (
        <div className="welcome-back-banner">
          <p>
            👋 Chào mừng bạn quay lại! Hãy thử thanh toán lại hoặc tiếp tục mua
            sắm.
          </p>
          <button
            onClick={() => setShowWelcomeBack(false)}
            className="close-banner"
          >
            ✕
          </button>
        </div>
      )}

      <h1>🛒 Cửa hàng Apple Store</h1>

      {/* Danh sách sản phẩm */}
      <div className="products-section">
        <h2>Sản phẩm</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">{product.image}</div>
              <h3>{product.name}</h3>
              <p className="product-price">{formatCurrency(product.price)}</p>
              <button className="add-btn" onClick={() => addToCart(product)}>
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Giỏ hàng */}
      <div className="cart-section">
        <h2>Giỏ hàng ({cart.length} sản phẩm)</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Giỏ hàng trống</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-image">{item.image}</span>
                    <div>
                      <h4>{item.name}</h4>
                      <p>{formatCurrency(item.price)}</p>
                    </div>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="total">
                <h3>Tổng cộng: {formatCurrency(getTotalAmount())}</h3>
              </div>

              <button
                className="payment-btn"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "💳 Thanh toán VNPay"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
