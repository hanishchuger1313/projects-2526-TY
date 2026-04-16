// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/hero.css";

// const Hero = () => {
//   const navigate = useNavigate();

//   return (
//     <section className="hero" id="hero">
//       <div className="hero-content">
//         <h1>
//           Pure Water Delivered <br /> to Your Doorstep
//         </h1>

//         <p>
//           Gurumauli Aqua is your trusted partner for clean, safe drinking water.
//           Order water jars easily and get them delivered fresh to your home or office.
//         </p>

//         <div className="hero-buttons">
//           <button
//             className="btn primary"
//             onClick={() => navigate("/login")}
//           >
//             Order Water Jar
//           </button>

//           <button
//             className="btn outline"
//             onClick={() => navigate("/loginSupplier")}
//           >
//             Supplier Login
//           </button>

//           <button
//             className="btn outline"
//             onClick={() => navigate("/loginDelivery")}
//           >
//             Delivery Staff Login
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <h1>
          Pure Water Delivered <br /> to Your Doorstep
        </h1>

        <p>
          Gurumauli Aqua is your trusted partner for clean, safe drinking water.
          Order water jars easily and get them delivered fresh to your home or office.
        </p>

        <div className="hero-buttons">
          <button
            className="btn primary"
            onClick={() => navigate("/login")}
          >
            Order Water Jar
          </button>

          <button
            className="btn outline"
            onClick={() => navigate("/login-supplier")}
          >
            Supplier Login
          </button>

          <button
            className="btn outline"
            onClick={() => navigate("/login-delivery")}
          >
            Delivery Staff Login
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;