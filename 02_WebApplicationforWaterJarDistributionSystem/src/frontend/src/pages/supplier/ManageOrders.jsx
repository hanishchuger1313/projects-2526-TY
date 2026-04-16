import React, { useEffect, useState } from "react";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import API from "../../utils/api";
import "./ManageOrders.css";

const ManageOrders = () => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/all");
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/update-status/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const updatePayment = async (id) => {
    try {
      await API.put(`/orders/payment/${id}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment");
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "-";
  };

  return (
    <div className="dashboard-layout">

      <SupplierSidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="orders-container">

          <h2>Orders History</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Delivery Date</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="9">No orders found</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id}>

                      <td>ORD-{order._id?.slice(-4)}</td>
                      <td>{order.type || "-"}</td>
                      <td>{order.user?.name || "N/A"}</td>

                      <td>
                        {order.type === "regular"
                          ? `${formatDate(order.startDate)} - ${formatDate(order.endDate)}`
                          : formatDate(order.deliveryDate)}
                      </td>

                      <td>{order.jars || 0} Jars</td>
                      <td>₹{order.totalAmount || 0}</td>

                      <td>
                        <span className={`status ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <span className={`payment ${order.paymentStatus?.toLowerCase()}`}>
                          {order.paymentStatus || "Pending"}
                        </span>

                        {order.paymentStatus !== "Paid" && order.status === "Delivered" && (
                          <button
                            className="collect-payment-btn"
                            onClick={() => updatePayment(order._id)}
                          >
                            Collect
                          </button>
                        )}
                      </td>

                      <td>

                        {order.status === "Pending" && (
                          <>
                            <button
                              className="confirm-btn"
                              onClick={() => updateStatus(order._id, "Confirmed")}
                            >
                              ✔
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() => updateStatus(order._id, "Rejected")}
                            >
                              ✖
                            </button>
                          </>
                        )}

                        {order.status === "Confirmed" && (
                          <button
                            className="invoice-btn"
                            onClick={() => setSelectedOrder(order)}
                          >
                            🧾
                          </button>
                        )}

                        <button
                          className="view-btn"
                          onClick={() => setSelectedOrder(order)}
                        >
                          ➜
                        </button>

                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* ===== INVOICE MODAL ===== */}
          {selectedOrder && (
            <div
              className="invoice-overlay"
              onClick={() => setSelectedOrder(null)}
            >

              <div
                className="invoice-container"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="invoice-top">
                  <div>
                    <h2>AquaFlow Invoice</h2>
                    <p>Order ID: ORD-{selectedOrder._id?.slice(-4)}</p>
                  </div>

                  <button
                    className="close-btn"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✖
                  </button>
                </div>

                <div className="invoice-content">

                  <div className="invoice-section">

                    <div>
                      <h4>Billed To</h4>
                      <p className="customer-name">
                        {selectedOrder.user?.name || "N/A"}
                      </p>
                      <p>{selectedOrder.address || "-"}</p>
                    </div>

                    <div>
                      <h4>Order Details</h4>
                      <p>
                        Delivery Date: {formatDate(
                          selectedOrder.type === "regular"
                            ? selectedOrder.startDate
                            : selectedOrder.deliveryDate
                        )}
                      </p>
                      <p>Type: {selectedOrder.type}</p>

                      <span className={`badge ${selectedOrder.status?.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>

                  </div>

                  <div className="invoice-table">

                    <div className="table-header">
                      <span>Description</span>
                      <span>Qty</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>

                    <div className="table-row">
                      <span>Premium Water Jar (20L)</span>
                      <span>{selectedOrder.jars}</span>
                      <span>₹{selectedOrder.pricePerJar}</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>

                  </div>

                  {/* ===== PAYMENT DETAILS ===== */}
                  <div className="invoice-total">

                    <div className="amount-row">
                      <span>Total Amount</span>
                      <strong>₹{selectedOrder.totalAmount || 0}</strong>
                    </div>

                    <div className="amount-row advance">
                      <span>Advance Paid</span>
                      <strong>₹{selectedOrder.advancePayment || 0}</strong>
                    </div>

                    <div className="amount-row remaining">
                      <span>Remaining Amount</span>
                      <strong>₹{selectedOrder.remainingAmount || 0}</strong>
                    </div>

                  </div>

                  {/* ===== PAYMENT HISTORY ===== */}
                  {selectedOrder.paymentHistory && selectedOrder.paymentHistory.length > 0 && (
                    <div className="payment-history">

                      <h4>Payment History</h4>

                      {selectedOrder.paymentHistory.map((p, index) => (
                        <div key={index} className="payment-row">
                          <span>{p.type}</span>
                          <span>₹{p.amount}</span>
                          <span>{new Date(p.date).toLocaleDateString()}</span>
                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ManageOrders;