import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./DeliverySidebar.css";

const DeliverySidebar = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/login-delivery");
  };

  return (
    <div className="delivery-sidebar">

      <div className="logo">
        <h2>Gurumauli Aqua</h2>
      </div>

      <ul className="menu">

        <li className={location.pathname === "/delivery/dashboard" ? "active" : ""}>
          <Link to="/delivery/dashboard">Dashboard</Link>
        </li>

        <li className={location.pathname === "/delivery/assigned" ? "active" : ""}>
          <Link to="/delivery/assigned">Deliveries</Link>
        </li>

      </ul>

      <div className="logout">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

    </div>
  );
};

export default DeliverySidebar;