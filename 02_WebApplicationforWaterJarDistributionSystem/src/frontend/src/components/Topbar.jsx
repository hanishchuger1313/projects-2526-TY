import React from "react";
import "./Topbar.css";

const Topbar = () => {
  const name = localStorage.getItem("name") || "User";

  return (
    <div className="topbar-container">
      
      <div className="topbar-right">
        <div className="user-info">
          <h4>{name}</h4>
          <p>Customer Account</p>
        </div>

        <div className="profile-icon">
          <span>{name.charAt(0).toUpperCase()}</span>
        </div>
      </div>

    </div>
  );
};

export default Topbar;