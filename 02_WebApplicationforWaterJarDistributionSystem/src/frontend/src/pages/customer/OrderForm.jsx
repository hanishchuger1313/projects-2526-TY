import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "../../components/CustomerSidebar";
import Topbar from "../../components/Topbar";
import API from "../../utils/api";
import "./OrderForm.css";

const OrderForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "regular",
    jars: 1,
    frequency: "daily",
    startDate: "",
    endDate: "",
    deliveryDate: "",
    address: "",
    pincode: "",
  });

  const pricePerJar = 20;
  const today = new Date().toISOString().split("T")[0];

  const allowedPincodes = ["424311", "424001", "424002"];

  // ✅ FIXED TOTAL CALCULATION (with duration)
  const calculateTotal = () => {
    const jars = Number(form.jars) || 0;

    if (form.type === "regular" && form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      const days =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      return jars * pricePerJar * (days > 0 ? days : 0);
    }

    return jars * pricePerJar;
  };

  // ✅ calculate days (for display)
  const calculateDays = () => {
    if (form.startDate && form.endDate) {
      return (
        Math.ceil(
          (new Date(form.endDate) - new Date(form.startDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );
    }
    return 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ KEEP YOUR VALIDATION (NO CHANGE)
  const validateForm = () => {
  console.log("Validation running..."); // 👈 debug

  if (!form.jars || form.jars <= 0) {
    alert("Enter valid jars");
    return false;
  }

  if (form.type === "regular") {
    if (!form.startDate || !form.endDate) {
      alert("Select dates");
      return false;
    }

    if (new Date(form.startDate) < new Date(today)) {
      alert("Start date cannot be in the past");
      return false;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert("Invalid dates");
      return false;
    }
  } else {
    if (!form.deliveryDate) {
      alert("Select delivery date");
      return false;
    }

    if (new Date(form.deliveryDate) < new Date(today)) {
      alert("Delivery date cannot be in the past");
      return false;
    }
  }

  if (!form.address) {
    alert("Enter address");
    return false;
  }

  if (!allowedPincodes.includes(form.pincode)) {
    alert("Invalid pincode");
    return false;
  }

  console.log("Validation passed ✅");
  return true;
};




  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Submit clicked");

  if (!validateForm()) return;

  try {
    console.log("Calling API...");

    const res = await API.post("/orders/create", {
      ...form,
      totalAmount: calculateTotal(),
    });

    console.log("API RESPONSE:", res); // 👈 VERY IMPORTANT

    alert("Order placed successfully!");
    navigate("/customer/dashboard");

  } catch (error) {
    console.error("FULL ERROR:", error.response || error); // 👈 IMPORTANT
    alert("Error placing order");
  }
};
  const total = calculateTotal();
  const advance = Math.floor(total * 0.2);

  return (
    <div className="dashboard-layout">
      <CustomerSidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="order-container">
          <div className="order-card">

            <div className="order-header">
              <h2>New Delivery Request</h2>
              <p>Choose between regular or event delivery</p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Order Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="regular">Regular</option>
                    <option value="wedding">Wedding</option>
                    <option value="birthday party">Birthday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Jars</label>
                  <input
                    type="number"
                    name="jars"
                    value={form.jars}
                    onChange={handleChange}
                  />
                </div>

                {form.type === "regular" && (
                  <>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        min={today}
                        value={form.startDate}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        min={form.startDate || today}
                        value={form.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {form.type !== "regular" && (
                  <div className="form-group">
                    <label>Delivery Date</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      min={today}
                      value={form.deliveryDate}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              <div className="full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full delivery address..."
                />
              </div>

              <div className="full-width">
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ IMPROVED PRICE DISPLAY */}
              <div className="price-section">

                <div>
                  <h3>Price per Jar: ₹{pricePerJar}</h3>

                  {form.type === "regular" && form.startDate && form.endDate && (
                    <p>Duration: {calculateDays()} days</p>
                  )}

                  <h2>Total: ₹{total}</h2>
                  <p>Advance (20%): ₹{advance}</p>

                  <p style={{ color: "#555" }}>
                    Advance will be required after supplier confirmation
                  </p>
                </div>

                <button type="submit" className="place-btn">
                  Place Order
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;