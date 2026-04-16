import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import DeliverySidebar from "../../components/DeliverySidebar";
import Topbar from "../../components/Topbar";
import "./Deliveries.css";

const Deliveries = () => {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {

      const res = await API.get("/delivery/today");

      const sortedOrders = res.data.sort((a, b) => {

        // Regular orders first
        if (a.type === "regular" && b.type !== "regular") return -1;
        if (a.type !== "regular" && b.type === "regular") return 1;

        // Pending before delivered
        if (a.status !== "Delivered" && b.status === "Delivered") return -1;
        if (a.status === "Delivered" && b.status !== "Delivered") return 1;

        // Latest first
        return new Date(b.createdAt) - new Date(a.createdAt);

      });

      setOrders(sortedOrders);

    } catch (err) {
      console.log(err);
    }
  };

  const markDelivered = async (id) => {

    await API.put(`/delivery/deliver/${id}`);

    fetchOrders();
  };

  const collectEmpty = async (id) => {

    await API.put(`/delivery/collect/${id}`, {
      collected: 1
    });

    fetchOrders();
  };


  const collectPayment = async (id) => {

    await API.put(`/orders/payment/${id}`);

    fetchOrders();

  };

  return (
    <div className="delivery-layout">

      <DeliverySidebar />

      <div className="delivery-main">

        <Topbar />

        <h2>Assigned Deliveries</h2>

        <table className="delivery-table">

          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Date</th>
              <th>Jars</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {orders.map(order => (

              <tr key={order._id}>

                <td>ORD-{order._id.slice(-4)}</td>

                <td>{order.user?.name}</td>

                <td>{order.type}</td>

                <td>
                  {order.type === "regular"
                    ? `${new Date(order.startDate).toLocaleDateString()} - ${new Date(order.endDate).toLocaleDateString()}`
                    : new Date(order.deliveryDate).toLocaleDateString()}
                </td>

                <td>{order.jars}</td>


                <td>{order.status}</td>

                <td>

                  <span className={`payment ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus || "Pending"}
                  </span>

                  {/* {order.status === "Delivered" && order.paymentStatus !== "Collected" && (

                    // <button
                    //   className="collect-payment-btn"
                    //   onClick={() => collectPayment(order._id)}
                    // >
                    //   Collect
                    // </button>

                  )} */}

                </td>

                <td>

                  {order.status !== "Delivered" && (
                    <button
                      className="deliver-btn"
                      onClick={() => markDelivered(order._id)}
                    >
                      Deliver
                    </button>
                  )}

                  {order.pendingEmptyJars > 0 && (
                    <button
                      className="collect-btn"
                      onClick={() => collectEmpty(order._id)}
                    >
                      Collect
                    </button>
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Deliveries;