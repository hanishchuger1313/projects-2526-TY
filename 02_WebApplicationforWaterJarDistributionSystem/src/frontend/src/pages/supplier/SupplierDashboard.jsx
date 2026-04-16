import React, { useEffect, useState } from "react";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import API from "../../utils/api";
import "./SupplierDashboard.css";


const SupplierDashboard = () => {

  const [orders,setOrders] = useState([]);

  useEffect(()=>{
    fetchOrders();
  },[]);

  const fetchOrders = async()=>{
    const res = await API.get("/orders/all");
    setOrders(res.data);
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o=>o.status==="Pending").length;
  const completedOrders = orders.filter(o=>o.status==="Delivered").length;

  const todayOrders = orders.filter(o=>{
    const today = new Date().toDateString();
    const date = new Date(o.createdAt).toDateString();
    return today === date;
  }).length;

  const weeklyOrders = orders.filter(o=>{
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    const diff = now - orderDate;
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const totalRevenue = orders.reduce((sum,o)=>{
    if(o.status==="Delivered") return sum + o.totalAmount;
    return sum;
  },0);

  return(

<div className="dashboard-layout">

<SupplierSidebar/>

<div className="dashboard-main">

<Topbar/>

<div className="dashboard-content">

<h1>Dashboard</h1>
<p className="dashboard-sub">
Welcome back! Here's an overview of your business.
</p>

{/* ===== STATS GRID ===== */}

<div className="stats-grid">

<div className="stat-card">
<h4>Total Orders</h4>
<h2>{totalOrders}</h2>
<p>All time orders</p>
</div>

<div className="stat-card">
<h4>Pending Orders</h4>
<h2>{pendingOrders}</h2>
<p>Awaiting processing</p>
</div>

<div className="stat-card">
<h4>Completed Orders</h4>
<h2>{completedOrders}</h2>
<p>Successfully delivered</p>
</div>

<div className="stat-card">
<h4>Total Revenue</h4>
<h2>₹{totalRevenue}</h2>
<p>All time revenue</p>
</div>

<div className="stat-card">
<h4>Today's Orders</h4>
<h2>{todayOrders}</h2>
<p>Orders received today</p>
</div>

<div className="stat-card">
<h4>Weekly Orders</h4>
<h2>{weeklyOrders}</h2>
<p>Orders this week</p>
</div>

</div>


{/* ===== RECENT ORDERS ===== */}

<div className="recent-orders">

<h3>Recent Orders</h3>
<p>Latest orders from your customers</p>

<table>

<thead>
<tr>
<th>Order ID</th>
<th>Customer</th>
<th>Jars</th>
<th>Date</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{orders.slice(0,5).map(order=>(
<tr key={order._id}>

<td>ORD-{order._id.slice(-4)}</td>
<td>{order.user?.name}</td>
<td>{order.jars}</td>
<td>{new Date(order.createdAt).toLocaleDateString()}</td>

<td>
<span className={`status ${order.status.toLowerCase()}`}>
{order.status}
</span>
</td>

</tr>
))}

</tbody>

</table>

</div>

</div>
</div>
</div>

);
};

export default SupplierDashboard;