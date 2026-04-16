import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./CustomerSidebar.css";

const CustomerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="customer-sidebar">
      <div className="logo">
        <h2>Gurumauli Aqua</h2>
      </div>

      <ul>
        <li className={location.pathname === "/customer/dashboard" ? "active" : ""}>
          <Link to="/customer/dashboard">Dashboard</Link>
        </li>

        <li className={location.pathname === "/customer/order" ? "active" : ""}>
          <Link to="/customer/order">New Order</Link>
        </li>

        <li className={location.pathname === "/customer/orders" ? "active" : ""}>
          <Link to="/customer/orders">My Orders</Link>
        </li>

        {/* <li className={location.pathname === "/customer/subscription" ? "active" : ""}>
          <Link to="/customer/subscription">Subscriptions</Link>
        </li> */}
      </ul>

      <div className="logout" onClick={logout}>
        Logout
      </div>
    </div>
  );
};

export default CustomerSidebar;