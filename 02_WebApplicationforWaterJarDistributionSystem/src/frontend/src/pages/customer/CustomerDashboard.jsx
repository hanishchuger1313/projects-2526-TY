import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaClock, FaCheckCircle, FaTruck } from "react-icons/fa";
import API from "../../utils/api";
import CustomerSidebar from "../../components/CustomerSidebar";
import Topbar from "../../components/Topbar";
import "./CustomerDashboard.css";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0
  });

  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");
      const data = res.data;

      setOrders(data);

      setStats({
        total: data.length,
        pending: data.filter(o => o.status === "Pending").length,
        confirmed: data.filter(o => o.status === "Confirmed").length,
        delivered: data.filter(o => o.status === "Delivered").length,
      });

    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="dashboard-layout">

      <CustomerSidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="dashboard-content">

          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h2>Welcome Back, {name}!</h2>
              <p>Here's what's happening today.</p>
            </div>

            <button
              className="new-order-btn"
              onClick={() => navigate("/customer/order")}
            >
              + Place New Order
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">

            <div className="stat-card">
              <div className="icon blue-bg">
                <FaShoppingCart />
              </div>
              <div>
                <h4>Total Orders</h4>
                <h2>{stats.total}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon orange-bg">
                <FaClock />
              </div>
              <div>
                <h4>Active / Pending</h4>
                <h2>{stats.pending}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon green-bg">
                <FaCheckCircle />
              </div>
              <div>
                <h4>Confirmed</h4>
                <h2>{stats.confirmed}</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon purple-bg">
                <FaTruck />
              </div>
              <div>
                <h4>Delivered</h4>
                <h2>{stats.delivered}</h2>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="dashboard-bottom">

            {/* Recent Orders */}
            <div className="recent-box">
              <h3>Recent Orders</h3>

              {orders.length === 0 ? (
                <p style={{color:"#777"}}>No recent orders.</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Jars</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order, index) => (
                      <tr key={index}>
                        <td>{order.type}</td>
                        <td>{order.jars}</td>
                        <td>
                          <span className={`status ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-box">
              <h3>Quick Stats</h3>

              <div className="progress-group">
                <div className="progress-label">
                  <span>Completion Rate</span>
                  <span>
                    {stats.total === 0 ? 0 :
                      Math.round((stats.delivered / stats.total) * 100)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill blue"
                    style={{
                      width: stats.total === 0 ? "0%" :
                        `${Math.round((stats.delivered / stats.total) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;