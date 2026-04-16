import React, { useEffect, useState } from "react";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import API from "../../utils/api";
import { Line, Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reports.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {

  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("monthly");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await API.get("/orders/all");
    setOrders(res.data);
  };

  /* ===== PAYMENT FILTER ===== */

  const getFilteredPayments = () => {
    const now = new Date();
    let payments = [];

    orders.forEach(order => {
      if (order.paymentHistory) {
        order.paymentHistory.forEach(p => {
          payments.push({ ...p, order });
        });
      }
    });

    return payments.filter(p => {
      const d = new Date(p.date);

      if (view === "daily") return d.toDateString() === now.toDateString();

      if (view === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }

      if (view === "monthly") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return d >= monthAgo;
      }

      return true;
    });
  };

  const filteredPayments = getFilteredPayments();

  /* ===== CALCULATIONS ===== */

  const revenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalOrders = [
    ...new Set(filteredPayments.map(p => p.order._id))
  ].length;

  const completed = filteredPayments.filter(
    p => p.order.status === "Delivered"
  ).length;

  const jarsSold = filteredPayments.reduce(
    (sum, p) => sum + (p.order.jars || 0),
    0
  );

  const jarsReturned = Math.floor(jarsSold * 0.9);

  const returnRate =
    jarsSold === 0 ? 0 : Math.round((jarsReturned / jarsSold) * 100);

  /* ===== DELIVERY + PAYMENT METRICS ===== */

  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered"
  );

  const deliveredCount = deliveredOrders.length;

  const fullyPaidCount = deliveredOrders.filter(
    (o) => o.paymentStatus === "Paid"
  ).length;

  const partialPaidCount = deliveredOrders.filter(
    (o) => o.paymentStatus === "Partial"
  ).length;

  /* ===== FIXED PENDING ===== */

  const uniqueOrdersMap = {};

  filteredPayments.forEach(p => {
    uniqueOrdersMap[p.order._id] = p.order;
  });

  const pendingAmount = Object.values(uniqueOrdersMap).reduce(
    (sum, o) => sum + (o.remainingAmount || 0),
    0
  );

  /* ===== ADVANCE vs REMAINING ===== */

  let advanceTotal = 0;

  orders.forEach(o => {
    if (o.paymentHistory) {
      o.paymentHistory.forEach(p => {
        if (p.type === "Advance") advanceTotal += p.amount;
      });
    }
  });

  const remainingTotal = orders.reduce(
    (sum, o) => sum + (o.remainingAmount || 0),
    0
  );

  const paymentSplitChart = {
    labels: ["Advance", "Remaining"],
    datasets: [
      {
        data: [advanceTotal, remainingTotal],
        backgroundColor: ["#facc15", "#22c55e"]
      }
    ]
  };

  /* ===== ORDERS TREND ===== */

  const orderData = {};

  orders.forEach(o => {
    const date = new Date(o.createdAt).toLocaleDateString();
    orderData[date] = (orderData[date] || 0) + 1;
  });

  const ordersChart = {
    labels: Object.keys(orderData),
    datasets: [
      {
        label: "Orders",
        data: Object.values(orderData),
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        tension: 0.4
      }
    ]
  };

  /* ===== REVENUE CHART ===== */

  const revenueByDate = {};

  filteredPayments.forEach(p => {
    const date = new Date(p.date).toLocaleDateString();
    revenueByDate[date] = (revenueByDate[date] || 0) + p.amount;
  });

  const revenueChart = {
    labels: Object.keys(revenueByDate),
    datasets: [
      {
        label: "Revenue",
        data: Object.values(revenueByDate),
        backgroundColor: "#10b981"
      }
    ]
  };

  /* ===== PDF ===== */

  const exportReport = () => {
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Gurumauli Aqua", 14, 18);

  doc.setFontSize(11);
  doc.text("Water Jar Delivery System", 14, 25);

  /* ===== TITLE ===== */
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.text("Delivery & Payment Report", 14, 40);

  doc.setFontSize(10);
  doc.text(`Type: ${view.toUpperCase()}`, 14, 48);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 54);

  /* ===== FILTER ORDERS BASED ON VIEW ===== */

  const now = new Date();

  const filteredOrders = orders.filter(o => {
    const date = new Date(o.createdAt);

    if (view === "daily") {
      return date.toDateString() === now.toDateString();
    }

    if (view === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    if (view === "monthly") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo;
    }

    return true;
  });

  /* ===== SPLIT DATA ===== */

  const fullyPaidOrders = filteredOrders.filter(
    (o) => o.status === "Delivered" && o.paymentStatus === "Paid"
  );

  const pendingOrders = filteredOrders.filter(
    (o) => o.status !== "Delivered"
  );

  /* ===== TABLE 1: FULLY PAID ===== */

  doc.setFontSize(13);
  doc.text("Fully Paid Deliveries", 14, 65);

  const paidTable = fullyPaidOrders.map(o => [
    `ORD-${o._id.slice(-4)}`,
    o.user?.name,
    o.jars,
    o.totalAmount,
    "Paid"
  ]);

  autoTable(doc, {
    startY: 70,
    head: [["Order ID", "Customer", "Jars", "Amount", "Status"]],
    body: paidTable,
    headStyles: { fillColor: [34, 197, 94] },
    alternateRowStyles: { fillColor: [240, 255, 240] }
  });

  /* ===== TABLE 2: PENDING ===== */

  let finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.text("Pending Deliveries", 14, finalY);

  const pendingTable = pendingOrders.map(o => [
    `ORD-${o._id.slice(-4)}`,
    o.user?.name,
    o.jars,
    o.status,
    o.remainingAmount
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Order ID", "Customer", "Jars", "Status", "Pending Amount"]],
    body: pendingTable,
    headStyles: { fillColor: [239, 68, 68] },
    alternateRowStyles: { fillColor: [255, 245, 245] }
  });

  /* ===== FOOTER ===== */

  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(10);
  doc.setTextColor(120);

  doc.text("Generated by Gurumauli Aqua System", 14, pageHeight - 10);
  doc.text("Page 1", 180, pageHeight - 10);

  doc.save(`Gurumauli_${view}_Report.pdf`);
};

// pdf end 
  return (
    <div className="dashboard-layout">
      <SupplierSidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="reports-container">

          <div className="reports-header">
            <h1>Reports</h1>
            <button onClick={exportReport}>Export</button>
          </div>

          <div className="report-filter">
            <button className={view === "daily" ? "active" : ""} onClick={() => setView("daily")}>Daily</button>
            <button className={view === "weekly" ? "active" : ""} onClick={() => setView("weekly")}>Weekly</button>
            <button className={view === "monthly" ? "active" : ""} onClick={() => setView("monthly")}>Monthly</button>
          </div>

          <div className="report-grid">
            <div className="report-card"><h4>Orders</h4><h2>{totalOrders}</h2></div>
            <div className="report-card"><h4>Revenue</h4><h2>₹{revenue.toLocaleString()}</h2></div>
            <div className="report-card"><h4>Pending</h4><h2>₹{pendingAmount.toLocaleString()}</h2></div>
            <div className="report-card"><h4>Return Rate</h4><h2>{returnRate}%</h2></div>
          </div>

          <div className="charts-grid">
            <div className="chart-box"><h3>Orders Trend</h3><Line data={ordersChart} /></div>
            <div className="chart-box"><h3>Revenue</h3><Bar data={revenueChart} /></div>
            <div className="chart-box"><h3>Advance vs Remaining</h3><Pie data={paymentSplitChart} /></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;