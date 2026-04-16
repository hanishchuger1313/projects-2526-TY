import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import SupplierSidebar from "../../components/SupplierSidebar";
import Topbar from "../../components/Topbar";
import "./DeliveryStaff.css";

const DeliveryStaff = () => {

  const [staff, setStaff] = useState([]);

  const [form, setForm] = useState({
    name:"",
    email:"",
    phone:"",
    password:""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try{
      const res = await API.get("/staff/all");
      setStaff(res.data);
    }catch(err){
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      await API.post("/staff/create", form);

      fetchStaff();

      setForm({
        name:"",
        email:"",
        phone:"",
        password:""
      });

    }catch(err){
      console.log(err);
       console.log(err.response?.data); 
       alert(err.response?.data?.message || "Failed to add staff");
    }
  };

  /* ===== DELETE STAFF ===== */

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("Are you sure to remove this staff?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/staff/delete/${id}`);
      fetchStaff();
    } catch (err) {
      console.log(err);
      alert("Failed to delete staff");
    }
  };

  return (

    <div className="supplier-layout">

      <SupplierSidebar/>

      <div className="supplier-main">

        <Topbar/>

        <div className="supplier-content">

          <h2 className="page-title">Delivery Staff</h2>
          <p className="page-subtitle">
            Manage and add delivery staff members.
          </p>

          {/* FORM */}

          <div className="staff-form-card">

            <form onSubmit={handleSubmit} className="staff-form">

              <input name="name" placeholder="Staff Name" value={form.name} onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

              <button type="submit">Add Staff</button>

            </form>

          </div>

          {/* TABLE */}

          <div className="staff-table-card">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Action</th> 
                </tr>
              </thead>

              <tbody>

                {staff.map((s)=>(

                  <tr key={s._id}>

                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                        <div className="staff-avatar">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        {s.name}
                      </div>
                    </td>

                    <td>{s.email}</td>
                    <td>{s.phone}</td>

                    {/* DELETE BUTTON */}
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(s._id)}
                      >
                        Remove
                      </button>
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

export default DeliveryStaff;