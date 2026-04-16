import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../../utils/api";
import { Link } from "react-router-dom";


const LoginSupplier=()=>{

const navigate = useNavigate();

const [form,setForm]=useState({
email:"",
password:"",
role:"supplier"
});

const [error,setError]=useState("");

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

navigate("/supplier/dashboard");

}catch(err){
setError(err.response?.data?.message || "Login failed");
}
};

return(

<div className="auth-container">

<div className="auth-card">

<h2>Supplier Login</h2>

{error && <p>{error}</p>}

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
{/* <p>
Don't have account? <Link to="/register">Register</Link>
</p> */}


</div>
</div>

);
};

export default LoginSupplier;