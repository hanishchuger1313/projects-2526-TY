import React, { useEffect, useState } from "react";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import API from "../../utils/api";
import "./Customers.css";

const Customers = () => {

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await API.get("/customers/all");
    setCustomers(res.data);
  };

  return (
    <div className="dashboard-layout">

      <SupplierSidebar />
      <div className="dashboard-main">

        <Topbar />

        <div className="customers-container">

          <h2>Customers List</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
};

export default Customers;