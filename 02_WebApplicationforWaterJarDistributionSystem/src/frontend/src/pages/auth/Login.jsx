// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import API from "../../utils/api";

// const Login = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     role: "customer",
//   });

//   const [errors, setErrors] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     if (!form.email.includes("@")) return "Enter valid email";
//     if (form.password.length < 6) return "Password must be 6+ characters";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationError = validate();
//     if (validationError) {
//       setErrors(validationError);
//       return;
//     }
//     try {
//       const res = await API.post("/auth/login", form);

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.user.role);
//       localStorage.setItem("name", res.data.user.name);

//       if (res.data.user.role === "customer") {
//         navigate("/customer/dashboard");
//       } else if (res.data.user.role === "supplier") {
//         navigate("/supplier/dashboard");
//       } else {
//         navigate("/delivery/dashboard");
//       }

//     } catch (error) {
//       setErrors(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">

//         <div className="auth-header">
//           <h2>Gurumauli Aqua</h2>
//           <p>Premium Water Management</p>
//         </div>

//         <h3>Welcome Back</h3>

//         {errors && <p className="error">{errors}</p>}

//         <form onSubmit={handleSubmit}>

//           <select name="role" value={form.role} onChange={handleChange}>
//             <option value="customer">Customer</option>
//             <option value="delivery">Delivery Staff</option>
//             <option value="supplier">Supplier</option>
//           </select>

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//           />

//           <button type="submit">Login</button>

//         </form>
       
//         <p>
          
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>

//       </div>
//     </div>
//   );
  
// };

// export default Login;
// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import API from "../../utils/api";

// const Login = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     role: "customer",
//   });

//   const [errors, setErrors] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     if (!form.email.includes("@")) return "Enter valid email";
//     if (form.password.length < 6) return "Password must be 6+ characters";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationError = validate();
//     if (validationError) {
//       setErrors(validationError);
//       return;
//     }

//     try {
//       const res = await API.post("/auth/login", form);

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.user.role);
//       localStorage.setItem("name", res.data.user.name);

//       if (res.data.user.role === "customer") {
//         navigate("/customer/dashboard");
//       // } else if (res.data.user.role === "supplier") {
//       //   navigate("/supplier/dashboard");
//       // } else {
//       //   navigate("/delivery/dashboard");
//       }

//     } catch (error) {
//       setErrors(error.response?.data?.message || "Login failed");
//     }
//   };

//   const goHome = () => {
//     navigate("/");
//   };

//   return (
//     <>
//      {/* Back Button: Fixed to top right */}
//       <button onClick={goHome} className="back-btn">
//         ← Back
//       </button>
//     <div className="auth-container">

     

//       <div className="auth-card">

//         <div className="auth-header">
//           <h2>Gurumauli Aqua</h2>
//           <p>Premium Water Management</p>
//         </div>

//         <h3>Welcome Back</h3>

//         {errors && <p className="error">{errors}</p>}

//         <form onSubmit={handleSubmit}>

//           {/* <Text style="border:solid black 2px">Customer</Text> */}
//           <h2>Customer</h2>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//           />

//           <button type="submit">Login</button>

//         </form>

//         <p>
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>

//       </div>
//     </div>
//     </>
//   );
  
// };

// export default Login;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../utils/api";

const Login = () => {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    email:"",
    password:"",
    role:"customer"
  });

  const [error,setError] = useState("");

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    try{

      const res = await API.post("/auth/login",form);

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("role",res.data.user.role);
      localStorage.setItem("name",res.data.user.name);

      navigate("/customer/dashboard");

    }catch(err){
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return(

<div className="auth-container">

<div className="auth-card">

<h2>Customer Login</h2>

{error && <p className="error">{error}</p>}

<form onSubmit={handleSubmit}>

<input
type="email"
name="email"
placeholder="Email"
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
onChange={handleChange}
/>

<button type="submit">Login</button>

<button
type="button"
onClick={() => navigate("/")}
style={{
marginTop:"10px",
width:"100%",
padding:"10px",
background:"#6c757d",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Back
</button>


</form>

<p>
Don't have account? <Link to="/register">Register</Link>
</p>

{/* <button
  onClick={() => navigate("/")}
  style={{
    background:"#1c4a7b",
    padding:"10px 20px",
    borderRadius:"6px",
    border:"none",
    cursor:"pointer"
  }}
>
⬅ Back
</button> */}
</div>
</div>

  );
};

export default Login;