// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import API from "../../utils/api";


// const Register = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "customer"
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     if (form.name.length < 3) return "Name too short";
//     if (!form.email.includes("@")) return "Invalid email";
//     if (form.phone.length !== 10) return "Phone must be 10 digits";
//     if (form.password.length < 6) return "Password min 6 chars";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationError = validate();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     try {
//       await API.post("/auth/register", form);
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">

//         <div className="auth-header">
//           <h2>AquaFlow</h2>
//           <p>Premium Water Management</p>
//         </div>

//         <h3>Create Account</h3>

//         {error && <p className="error">{error}</p>}

//         <form onSubmit={handleSubmit}>

//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             onChange={handleChange}
//           />

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={handleChange}
//           />

//           <input
//             type="text"
//             name="phone"
//             placeholder="Phone Number"
//             onChange={handleChange}
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//           />

//           <button type="submit">Register</button>

//         </form>

//         <p>
//           Already have an account? <Link to="/">Login</Link>
//         </p>

//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../utils/api";

const Register = () => {
const navigate = useNavigate();

const [form, setForm] = useState({
name: "",
email: "",
phone: "",
password: "",
role: "customer"
});

const [error, setError] = useState("");

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const validate = () => {
if (form.name.length < 3) return "Name too short";
if (!form.email.includes("@")) return "Invalid email";
if (form.phone.length !== 10) return "Phone must be 10 digits";
if (form.password.length < 6) return "Password min 6 chars";
return "";
};

const handleSubmit = async (e) => {
e.preventDefault();


const validationError = validate();
if (validationError) {
  setError(validationError);
  return;
}

try {
  await API.post("/auth/register", form);
  navigate("/");
} catch (err) {
  setError(err.response?.data?.message || "Registration failed");
}


};

return ( <div className="auth-container"> <div className="auth-card">

```
    <div className="auth-header">
      <h2>AquaFlow</h2>
      <p>Premium Water Management</p>
    </div>

    <h3>Create Account</h3>

    {error && <p className="error">{error}</p>}

    <form onSubmit={handleSubmit}>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

     

      <button type="submit">Register</button>

    </form>

    <p>
      Already have an account? <Link to="/login">Login</Link>
    </p>

  </div>
</div>

);
};

export default Register;
