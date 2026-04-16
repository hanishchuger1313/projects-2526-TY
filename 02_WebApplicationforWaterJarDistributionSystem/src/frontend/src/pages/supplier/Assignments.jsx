import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import "./Assignments.css";

/* ===== DELIVERY STATUS ===== */
const getDeliveryStatus = (dateValue) => {
  if (!dateValue) return "normal";

  const today = new Date();
  const orderDate = new Date(dateValue);

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const orderOnly = new Date(
    orderDate.getFullYear(),
    orderDate.getMonth(),
    orderDate.getDate()
  );

  const diffDays =
    (orderOnly.getTime() - todayOnly.getTime()) /
    (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";

  return "normal";
};

/* ===== STAFF STATUS ===== */
const getStaffStatus = (staff) => {
  const current = staff.currentLoad ?? 0;
  const max = staff.maxCapacity ?? 200;

  if (current === 0) return "Free";
  if (current < max) return "Available";
  return "Full";
};

const Assignments = () => {
  const [staff, setStaff] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const staffRes = await API.get("/assignments/staff");
      const unassignedRes = await API.get("/assignments/unassigned");
      const assignedRes = await API.get("/assignments/assigned");

      setStaff(staffRes.data);
      setUnassigned(unassignedRes.data);
      setAssigned(assignedRes.data);
    } catch (error) {
      console.log("Assignment fetch error:", error);
    }
  };

  const handleAssign = async (orderId) => {
    const staffId = selectedStaff[orderId];

    console.log("Assigning:", { orderId, staffId });

    if (!staffId) {
      return alert("Please select staff before assigning");
    }

    try {
      await API.put(`/assignments/assign/${orderId}`, {
        staffId,
      });

      fetchData();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Assignment failed");
    }
  };

  return (
    <div className="supplier-layout">
      <SupplierSidebar />

      <div className="supplier-main">
        <Topbar />

        <div className="supplier-content">
          <h2 className="page-title">Delivery Assignment</h2>
          <p className="page-subtitle">
            Assign orders to delivery staff for fulfillment.
          </p>

          {/* ===== STAFF CARDS ===== */}
          <div className="staff-grid">
            {staff.map((member) => (
              <div key={member._id} className="staff-card">
                <div className="staff-avatar">👤</div>
                <div className="staff-info">
                  <h4>{member.name}</h4>
                  <p>{member.phone}</p>

                  <p>
                    Load: {member.currentLoad ?? 0}/
                    {member.maxCapacity ?? 200}
                  </p>

                  <span
                    className={`staff-status ${getStaffStatus(member).toLowerCase()}`}
                  >
                    {getStaffStatus(member)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ===== UNASSIGNED ===== */}
          <div className="section-card">
            <h3>Unassigned Orders</h3>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Jars</th>
                  <th>Delivery Date</th>
                  <th>Assign To</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {unassigned.map((order) => {
                  const deliveryDate =
                    order.type === "regular"
                      ? `${new Date(order.startDate).toLocaleDateString()} - ${new Date(order.endDate).toLocaleDateString()}`
                      : new Date(order.deliveryDate).toLocaleDateString();

                  const status = getDeliveryStatus(deliveryDate);

                  return (
                    <tr key={order._id}>
                      <td>ORD-{order._id.slice(-4)}</td>
                      <td>{order.user?.name}</td>
                      <td>{order.type}</td>
                      <td>{order.jars}</td>

                      <td className={`date-cell ${status}`}>
                        {deliveryDate}

                        {status === "today" && (
                          <span className="urgent-badge">⚡ TODAY</span>
                        )}
                        {status === "tomorrow" && (
                          <span className="urgent-badge">⚡ TOMORROW</span>
                        )}
                        {status === "overdue" && (
                          <span className="overdue-badge">❗ OVERDUE</span>
                        )}
                      </td>

                      {/* ✅ FIXED DROPDOWN */}
                      <td>
                        <select
                          className="select-input"
                          value={selectedStaff[order._id] || ""}
                          onChange={(e) =>
                            setSelectedStaff({
                              ...selectedStaff,
                              [order._id]: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Staff</option>

                          {staff.map((s) => {
                            const current = s.currentLoad ?? 0;
                            const max = s.maxCapacity ?? 200;

                            const isFull = current + order.jars > max;

                            return (
                              <option
                                key={s._id}
                                value={s._id}
                                disabled={isFull}
                              >
                                {s.name} (Load: {current}/{max}) -{" "}
                                {getStaffStatus(s)}
                              </option>
                            );
                          })}
                        </select>
                      </td>

                      <td>
                        <button
                          className="primary-btn"
                          onClick={() => handleAssign(order._id)}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===== ASSIGNED ===== */}
          <div className="section-card">
            <h3>Assigned Orders</h3>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Jars</th>
                  <th>Delivery Date</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {assigned.map((order) => {
                  const deliveryDate =
                    order.type === "regular"
                      ? `${new Date(order.startDate).toLocaleDateString()} - ${new Date(order.endDate).toLocaleDateString()}`
                      : new Date(order.deliveryDate).toLocaleDateString();

                  const status = getDeliveryStatus(deliveryDate);

                  return (
                    <tr key={order._id}>
                      <td>ORD-{order._id.slice(-4)}</td>
                      <td>{order.user?.name}</td>
                      <td>{order.type}</td>
                      <td>{order.jars}</td>

                      <td className={`date-cell ${status}`}>
                        {deliveryDate}

                        {status === "today" && (
                          <span className="urgent-badge">⚡ TODAY</span>
                        )}
                        {status === "tomorrow" && (
                          <span className="urgent-badge">⚡ TOMORROW</span>
                        )}
                        {status === "overdue" && (
                          <span className="overdue-badge">❗ OVERDUE</span>
                        )}
                      </td>

                      <td>{order.assignedTo?.name}</td>

                      <td>
                        <span className={`status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Assignments;