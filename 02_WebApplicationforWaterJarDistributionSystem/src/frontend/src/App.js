// // import {
// //   BrowserRouter as Router,
// //   Routes,
// //   Route,
// //   Navigate,
// // } from "react-router-dom";
// // import { useEffect, useState } from "react";

// // // ================= AUTH =================
// // import Login from "./pages/auth/Login";
// // import Register from "./pages/auth/Register";

// // // ================= CUSTOMER =================
// // import CustomerDashboard from "./pages/customer/CustomerDashboard";
// // import OrderForm from "./pages/customer/OrderForm";
// // import MyOrders from "./pages/customer/MyOrders";
// // import SubscriptionPage from "./pages/customer/SubscriptionPage";

// // // ================= SUPPLIER =================
// // import SupplierDashboard from "./pages/supplier/SupplierDashboard";
// // import ManageOrders from "./pages/supplier/ManageOrders";
// // import ManageSubscriptions from "./pages/supplier/ManageSubscriptions";

// // // ================= DELIVERY =================
// // import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
// // import AssignedOrders from "./pages/delivery/Deliveries";

// // // ================= PROTECTED ROUTE =================
// // import ProtectedRoute from "./components/ProtectedRoute";
// // import Customers from "./pages/supplier/Customers";

// // import Assignments from "./pages/supplier/Assignments";
// // import DeliveryStaff from "./pages/supplier/DeliveryStaff";

// // import Reports from "./pages/supplier/Reports";
// // import Home from "./pages/Home";

// // function App() {
// //   const [role, setRole] = useState(null);

// //   useEffect(() => {
// //     const storedRole = localStorage.getItem("role");
// //     setRole(storedRole);
// //   }, []);

// //   return (
// //     <Router>
// //       <Routes>
// //         {/* ================= DEFAULT REDIRECT ================= */}
// //         {/* <Route
// //           path="/"
// //           element={
// //             role ? (
// //               <Navigate to={`/${role}/dashboard`} replace />
// //             ) : (
// //               <Navigate to="/login" replace />
// //             )
// //           }
// //         /> */}

// //         {/* ================= PUBLIC ROUTES ================= */}
// //         {/* <Route
// //           path="/login"
// //           element={
// //             role ? <Navigate to={`/${role}/dashboard`} replace /> : <Login />
// //           }
// //         /> */}
// //         <Route path="/" element={<Home />} />

// //         <Route path="/login" element={<Login />} />

// //         <Route path="/register" element={<Register />} />

// //         {/* ================= CUSTOMER ROUTES ================= */}
// //         <Route
// //           path="/customer/dashboard"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <CustomerDashboard />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/customer/order"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <OrderForm />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/customer/orders"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <MyOrders />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/customer/subscription"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <SubscriptionPage />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= SUPPLIER ROUTES ================= */}
// //         <Route
// //           path="/supplier/dashboard"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <SupplierDashboard />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/supplier/customers"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Customers />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/supplier/orders"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageOrders />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/supplier/subscriptions"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageSubscriptions />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= DELIVERY ROUTES ================= */}
// //         <Route
// //           path="/delivery/dashboard"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <DeliveryDashboard />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/delivery/assigned"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <AssignedOrders />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/staff"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <DeliveryStaff />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/reports"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Reports />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/supplier/assignments"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Assignments />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //   path="/customer/entry"
// //   element={
// //     <ProtectedRoute role="customer">
// //       <EntryPage />
// //     </ProtectedRoute>
// //   }
// // />




// //         {/* ================= 404 ================= */}
// //         <Route
// //           path="*"
// //           element={
// //             <div style={{ textAlign: "center", marginTop: "80px" }}>
// //               <h2>404 - Page Not Found</h2>
// //             </div>
// //           }
// //         />
// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;
// // import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// // import { useEffect, useState } from "react";

// // // ================= AUTH =================
// // import Login from "./pages/auth/Login";
// // import LoginSupplier from "./pages/auth/LoginSupplier";
// // import LoginDelivery from "./pages/auth/LoginDelivery";
// // import Register from "./pages/auth/Register";

// // // ================= CUSTOMER =================
// // import CustomerDashboard from "./pages/customer/CustomerDashboard";
// // import OrderForm from "./pages/customer/OrderForm";
// // import MyOrders from "./pages/customer/MyOrders";
// // import SubscriptionPage from "./pages/customer/SubscriptionPage";

// // // ================= SUPPLIER =================
// // import SupplierDashboard from "./pages/supplier/SupplierDashboard";
// // import ManageOrders from "./pages/supplier/ManageOrders";
// // import ManageSubscriptions from "./pages/supplier/ManageSubscriptions";
// // import Customers from "./pages/supplier/Customers";
// // import Assignments from "./pages/supplier/Assignments";
// // import DeliveryStaff from "./pages/supplier/DeliveryStaff";
// // import Reports from "./pages/supplier/Reports";

// // // ================= DELIVERY =================
// // import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
// // import AssignedOrders from "./pages/delivery/Deliveries";

// // // ================= PROTECTED ROUTE =================
// // import ProtectedRoute from "./components/ProtectedRoute";

// // import Home from "./pages/Home";
// // // import AboutUs from "./components/About Us";

// // function App() {
// //   const [role, setRole] = useState(null);

// //   useEffect(() => {
// //     const storedRole = localStorage.getItem("role");
// //     setRole(storedRole);
// //   }, []);

// //   return (
// //     <Router>
// //       <Routes>
// //         {/* ================= DEFAULT ROUTE ================= */}
// //         <Route
// //           path="/"
// //           element={
// //             role ? <Navigate to={`/${role}/dashboard`} replace /> : <Home />
// //           }
// //         />

// //         {/* ================= AUTH ROUTES ================= */}
// //         <Route path="/login" element={<Login />} />

// //         <Route path="/login-supplier" element={<LoginSupplier />} />

// //         <Route path="/login-delivery" element={<LoginDelivery />} />

// //         <Route path="/register" element={<Register />} />

// //         {/* ================= CUSTOMER ROUTES ================= */}
// //         <Route
// //           path="/customer/dashboard"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <CustomerDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/order"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <OrderForm />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/orders"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <MyOrders />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/subscription"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <SubscriptionPage />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= SUPPLIER ROUTES ================= */}
// //         <Route
// //           path="/supplier/dashboard"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <SupplierDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/customers"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Customers />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/orders"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageOrders />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/subscriptions"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageSubscriptions />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/staff"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <DeliveryStaff />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/reports"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Reports />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/assignments"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Assignments />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= DELIVERY ROUTES ================= */}
// //         <Route
// //           path="/delivery/dashboard"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <DeliveryDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/delivery/assigned"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <AssignedOrders />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= 404 ================= */}
// //         <Route
// //           path="*"
// //           element={
// //             <div style={{ textAlign: "center", marginTop: "80px" }}>
// //               <h2>404 - Page Not Found</h2>
// //             </div>
// //           }
// //         />
// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;

// // import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// // import { useEffect, useState } from "react";

// // // ================= AUTH =================
// // import Login from "./pages/auth/Login";
// // import LoginSupplier from "./pages/auth/LoginSupplier";
// // import LoginDelivery from "./pages/auth/LoginDelivery";
// // import Register from "./pages/auth/Register";

// // // ================= CUSTOMER =================
// // import CustomerDashboard from "./pages/customer/CustomerDashboard";
// // import OrderForm from "./pages/customer/OrderForm";
// // import MyOrders from "./pages/customer/MyOrders";
// // import SubscriptionPage from "./pages/customer/SubscriptionPage";

// // // ================= SUPPLIER =================
// // import SupplierDashboard from "./pages/supplier/SupplierDashboard";
// // import ManageOrders from "./pages/supplier/ManageOrders";
// // import ManageSubscriptions from "./pages/supplier/ManageSubscriptions";
// // import Customers from "./pages/supplier/Customers";
// // import Assignments from "./pages/supplier/Assignments";
// // import DeliveryStaff from "./pages/supplier/DeliveryStaff";
// // import Reports from "./pages/supplier/Reports";

// // // ================= DELIVERY =================
// // import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
// // import AssignedOrders from "./pages/delivery/Deliveries";

// // // ================= PROTECTED ROUTE =================
// // import ProtectedRoute from "./components/ProtectedRoute";

// // // ================= PUBLIC PAGES =================
// // import Home from "./pages/Home";
// // import Aboutus from "./components/Aboutus"; // ✅ ADD THIS

// // function App() {
// //   const [role, setRole] = useState(null);

// //   useEffect(() => {
// //     const storedRole = localStorage.getItem("role");
// //     setRole(storedRole);
// //   }, []);

// //   return (
// //     <Router>
// //       <Routes>

// //         {/* ================= HOME ================= */}
// //         <Route
// //           path="/"
// //           element={
// //             role ? <Navigate to={`/${role}/dashboard`} replace /> : <Home />
// //           }
// //         />

// //         {/* ================= ABOUT PAGE ================= */}
// //         <Route path="/about" element={<AboutUs />} />

// //         {/* ================= AUTH ROUTES ================= */}
// //         <Route path="/login" element={<Login />} />
// //         <Route path="/login-supplier" element={<LoginSupplier />} />
// //         <Route path="/login-delivery" element={<LoginDelivery />} />
// //         <Route path="/register" element={<Register />} />

// //         {/* ================= CUSTOMER ROUTES ================= */}
// //         <Route
// //           path="/customer/dashboard"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <CustomerDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/order"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <OrderForm />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/orders"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <MyOrders />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/customer/subscription"
// //           element={
// //             <ProtectedRoute role="customer">
// //               <SubscriptionPage />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= SUPPLIER ROUTES ================= */}
// //         <Route
// //           path="/supplier/dashboard"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <SupplierDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/customers"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Customers />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/orders"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageOrders />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/subscriptions"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <ManageSubscriptions />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/staff"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <DeliveryStaff />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/reports"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Reports />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/supplier/assignments"
// //           element={
// //             <ProtectedRoute role="supplier">
// //               <Assignments />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= DELIVERY ROUTES ================= */}
// //         <Route
// //           path="/delivery/dashboard"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <DeliveryDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/delivery/assigned"
// //           element={
// //             <ProtectedRoute role="delivery">
// //               <AssignedOrders />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* ================= 404 ================= */}
// //         <Route
// //           path="*"
// //           element={
// //             <div style={{ textAlign: "center", marginTop: "80px" }}>
// //               <h2>404 - Page Not Found</h2>
// //             </div>
// //           }
// //         />

// //       </Routes>
// //     </Router>
// //   );
// // }

// // export default App;

// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// // ================= AUTH =================
// import Login from "./pages/auth/Login";
// import LoginSupplier from "./pages/auth/LoginSupplier";
// import LoginDelivery from "./pages/auth/LoginDelivery";
// import Register from "./pages/auth/Register";

// // ================= CUSTOMER =================
// import CustomerDashboard from "./pages/customer/CustomerDashboard";
// import OrderForm from "./pages/customer/OrderForm";
// import MyOrders from "./pages/customer/MyOrders";
// import SubscriptionPage from "./pages/customer/SubscriptionPage";

// // ================= SUPPLIER =================
// import SupplierDashboard from "./pages/supplier/SupplierDashboard";
// import ManageOrders from "./pages/supplier/ManageOrders";
// import ManageSubscriptions from "./pages/supplier/ManageSubscriptions";
// import Customers from "./pages/supplier/Customers";
// import Assignments from "./pages/supplier/Assignments";
// import DeliveryStaff from "./pages/supplier/DeliveryStaff";
// import Reports from "./pages/supplier/Reports";

// // ================= DELIVERY =================
// import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
// import AssignedOrders from "./pages/delivery/Deliveries";

// // ================= PROTECTED ROUTE =================
// import ProtectedRoute from "./components/ProtectedRoute";

// // ================= PUBLIC PAGES =================
// import Home from "./pages/Home";
// // import AboutUs from "./components/AboutUs";


// function App() {

// const [role, setRole] = useState(null);

// useEffect(() => {
// const storedRole = localStorage.getItem("role");
// setRole(storedRole);
// }, []);

// return ( <Router> <Routes>

// ```
//     {/* ================= HOME ================= */}
//     <Route
//       path="/"
//       element={
//         role ? <Navigate to={`/${role}/dashboard`} replace /> : <Home />
//       }
//     />


//     {/* ================= AUTH ROUTES ================= */}
//     <Route path="/login" element={<Login />} />
//     <Route path="/login-supplier" element={<LoginSupplier />} />
//     <Route path="/login-delivery" element={<LoginDelivery />} />
//     <Route path="/register" element={<Register />} />

//     {/* ================= CUSTOMER ROUTES ================= */}
//     <Route
//       path="/customer/dashboard"
//       element={
//         <ProtectedRoute role="customer">
//           <CustomerDashboard />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/customer/order"
//       element={
//         <ProtectedRoute role="customer">
//           <OrderForm />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/customer/orders"
//       element={
//         <ProtectedRoute role="customer">
//           <MyOrders />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/customer/subscription"
//       element={
//         <ProtectedRoute role="customer">
//           <SubscriptionPage />
//         </ProtectedRoute>
//       }
//     />

//     {/* ================= SUPPLIER ROUTES ================= */}
//     <Route
//       path="/supplier/dashboard"
//       element={
//         <ProtectedRoute role="supplier">
//           <SupplierDashboard />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/customers"
//       element={
//         <ProtectedRoute role="supplier">
//           <Customers />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/orders"
//       element={
//         <ProtectedRoute role="supplier">
//           <ManageOrders />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/subscriptions"
//       element={
//         <ProtectedRoute role="supplier">
//           <ManageSubscriptions />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/staff"
//       element={
//         <ProtectedRoute role="supplier">
//           <DeliveryStaff />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/reports"
//       element={
//         <ProtectedRoute role="supplier">
//           <Reports />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/supplier/assignments"
//       element={
//         <ProtectedRoute role="supplier">
//           <Assignments />
//         </ProtectedRoute>
//       }
//     />

//     {/* ================= DELIVERY ROUTES ================= */}
//     <Route
//       path="/delivery/dashboard"
//       element={
//         <ProtectedRoute role="delivery">
//           <DeliveryDashboard />
//         </ProtectedRoute>
//       }
//     />

//     <Route
//       path="/delivery/assigned"
//       element={
//         <ProtectedRoute role="delivery">
//           <AssignedOrders />
//         </ProtectedRoute>
//       }
//     />

//     {/* ================= 404 ================= */}
//     <Route
//       path="*"
//       element={
//         <div style={{ textAlign: "center", marginTop: "80px" }}>
//           <h2>404 - Page Not Found</h2>
//         </div>
//       }
//     />

//   </Routes>
// </Router>


// );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ================= AUTH =================
import Login from "./pages/auth/Login";
import LoginSupplier from "./pages/auth/LoginSupplier";
import LoginDelivery from "./pages/auth/LoginDelivery";
import Register from "./pages/auth/Register";

// ================= CUSTOMER =================
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import OrderForm from "./pages/customer/OrderForm";
import MyOrders from "./pages/customer/MyOrders";
import SubscriptionPage from "./pages/customer/SubscriptionPage";

// ================= SUPPLIER =================
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import ManageOrders from "./pages/supplier/ManageOrders";
import ManageSubscriptions from "./pages/supplier/ManageSubscriptions";
import Customers from "./pages/supplier/Customers";
import Assignments from "./pages/supplier/Assignments";
import DeliveryStaff from "./pages/supplier/DeliveryStaff";
import Reports from "./pages/supplier/Reports";

// ================= DELIVERY =================
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import AssignedOrders from "./pages/delivery/Deliveries";

// ================= PROTECTED ROUTE =================
import ProtectedRoute from "./components/ProtectedRoute";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import AboutUs from "./components/AboutUs";   // ✅ About page import

function App() {

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <Router>
      <Routes>

        {/* ================= HOME ================= */}
        <Route
          path="/"
          element={
            role ? <Navigate to={`/${role}/dashboard`} replace /> : <Home />
          }
        />

        {/* ================= ABOUT ================= */}
        <Route path="/about" element={<AboutUs />} />

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-supplier" element={<LoginSupplier />} />
        <Route path="/login-delivery" element={<LoginDelivery />} />
        <Route path="/register" element={<Register />} />

        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/order"
          element={
            <ProtectedRoute role="customer">
              <OrderForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute role="customer">
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/subscription"
          element={
            <ProtectedRoute role="customer">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />

        {/* ================= SUPPLIER ROUTES ================= */}
        <Route
          path="/supplier/dashboard"
          element={
            <ProtectedRoute role="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/customers"
          element={
            <ProtectedRoute role="supplier">
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/orders"
          element={
            <ProtectedRoute role="supplier">
              <ManageOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/subscriptions"
          element={
            <ProtectedRoute role="supplier">
              <ManageSubscriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/staff"
          element={
            <ProtectedRoute role="supplier">
              <DeliveryStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/reports"
          element={
            <ProtectedRoute role="supplier">
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/assignments"
          element={
            <ProtectedRoute role="supplier">
              <Assignments />
            </ProtectedRoute>
          }
        />

        {/* ================= DELIVERY ROUTES ================= */}
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute role="delivery">
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/assigned"
          element={
            <ProtectedRoute role="delivery">
              <AssignedOrders />
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
