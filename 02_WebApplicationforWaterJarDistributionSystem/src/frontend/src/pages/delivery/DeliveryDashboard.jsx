import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import DeliverySidebar from "../../components/DeliverySidebar";
import Topbar from "../../components/Topbar";
import "./DeliveryDashboard.css";

const DeliveryDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    delivered: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await API.get("/delivery/dashboard");
    setStats(res.data);
  };

  return (
    <div className="delivery-layout">
      <DeliverySidebar />
      <div className="delivery-main">
        <Topbar />

        <div className="delivery-content">
          <h2>Welcome Back!</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Orders</h4>
              <p>{stats.total}</p>
            </div>

            <div className="stat-card">
              <h4>Confirmed</h4>
              <p>{stats.confirmed}</p>
            </div>

            <div className="stat-card">
              <h4>Delivered</h4>
              <p>{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;