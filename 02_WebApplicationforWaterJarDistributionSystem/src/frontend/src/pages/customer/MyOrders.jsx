import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "./MyOrders.css";
import CustomerSidebar from "../../components/CustomerSidebar";
import Topbar from "../../components/Topbar";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await API.get("/orders/my-orders");
    setOrders(res.data);
  };

  const payAdvance = async (order) => {
    try {
      const advance = Math.floor(order.totalAmount * 0.2);

      await API.put(`/orders/pay-advance/${order._id}`, {
        amount: advance,
      });

      // ✅ FIXED RECEIPT STATE
      setReceiptData({
        orderId: order._id,
        amount: advance,
        date: new Date()
      });

      setShowReceipt(true);

      fetchOrders();
    } catch (error) {
  console.error("Payment Error:", error.response || error);
  alert("Payment failed");
}
  };

  const handlePayRemaining = async (orderId) => {
  try {
    const confirmPay = window.confirm("Confirm payment?");

    if (!confirmPay) return;

    await API.post(`/orders/pay-remaining/${orderId}`);

    alert("Payment successful");

    fetchOrders(); // refresh

  } catch (err) {
    console.log(err.response?.data);
    console.log("FULL ERROR:", err.response?.data || err.message);
    alert("Payment failed");
  }
};

  return (
    <div className="dashboard-layout">
      <CustomerSidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="orders-grid">

          {orders.map(order => (
            <div key={order._id} className="order-card">

              <div className="order-header">
                <h4>{order.type}</h4>
                <span className={`status ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-info">
                <p><strong>Jars:</strong> {order.jars}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Advance:</strong> ₹{order.advancePayment || 0}</p>
                <p><strong>Remaining:</strong> ₹{order.remainingAmount || order.totalAmount}</p>
              </div>

              <div className="order-footer">

                {order.status === "Awaiting Payment" && (
                  <button
                    className="pay-btn"
                    onClick={() => payAdvance(order)}
                  >
                    Pay Advance
                  </button>
                )}

                {order.paymentStatus === "Advance Paid" && (
                  <span className="paid-status">Advance Paid</span>
                )}

              </div>

              {order.status === "Delivered" && order.remainingAmount > 0 && (
          <button
          className="pay-btn"
          onClick={() => handlePayRemaining(order._id)}
         >
    Pay Remaining ₹{order.remainingAmount}
  </button>
)}

            </div>
          ))}

        </div>

        {/* ✅ FIXED RECEIPT POPUP */}
        {showReceipt && receiptData && (
          <div className="receipt-overlay">
            <div className="receipt-box">

              <h2>Payment Successful ✅</h2>

              <p><strong>Order ID:</strong> ORD-{receiptData.orderId.slice(-4)}</p>
              <p><strong>Amount:</strong> ₹{receiptData.amount}</p>
              <p><strong>Date:</strong> {receiptData.date.toLocaleString()}</p>

              <button onClick={() => setShowReceipt(false)}>
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;