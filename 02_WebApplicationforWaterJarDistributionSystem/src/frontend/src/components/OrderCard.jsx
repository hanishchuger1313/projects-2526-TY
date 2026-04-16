import React, { useState } from "react";
import CustomerSidebar from "../../components/CustomerSidebar";
import Topbar from "../../components/Topbar";
import "./EntryPage.css";

function OrderCard() {

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [cans, setCans] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Entry Saved Successfully");

    setName("");
    setMobile("");
    setAddress("");
    setCans("");
  };

  return (
    <div className="dashboard-layout">

      <CustomerSidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="entry-container">

          <h2>Water Delivery Entry System</h2>

          <form className="entry-form" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <input
              type="number"
              placeholder="Water Cans"
              value={cans}
              onChange={(e) => setCans(e.target.value)}
            />

            <button type="submit">
              Save Entry
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default OrderCard;