import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./SupplierSidebar.css";

const SupplierSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/login-supplier");
  };

  return (
    <div className="supplier-sidebar">
      <div className="logo">
        <h2>Gurumauli Aqua</h2>
      </div>

      <ul>
        <li className={location.pathname === "/supplier/dashboard" ? "active" : ""}>
          <Link to="/supplier/dashboard">Dashboard</Link>
        </li>
        <li className={location.pathname === "/supplier/orders" ? "active" : ""}>
        <Link to="/supplier/orders">All Orders</Link></li>

        <li className={location.pathname === "/supplier/customers" ? "active" : ""}>
        <Link to="/supplier/customers">Customers</Link></li>
        <li className={location.pathname === "/supplier/assignments" ? "active" : ""}>
        <Link to="/supplier/assignments">Assignments</Link></li>
        <li className={location.pathname === "/supplier/reports" ? "active" : ""}>
        <Link to="/supplier/reports">Reports</Link></li>
        <li className={location.pathname === "/supplier/staff" ? "active" : ""}>
<Link to="/supplier/staff">Delivery Staff</Link>
</li>
      </ul>

      <div className="logout" onClick={logout}>Logout</div>
    </div>
  );
};

export default SupplierSidebar;