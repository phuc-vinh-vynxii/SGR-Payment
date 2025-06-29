import { BrowserRouter, Routes, Route } from "react-router-dom";
import PaymentPage from "./pages/payment.page";
import VNPAYReturnPage from "./pages/vnpayreturn.page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/vnpay-return" element={<VNPAYReturnPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
