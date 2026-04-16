// import React from "react";
// import "../styles/features.css";

// const Features = () => {
//   return (
//     <section className="features" id="features">
//       <h2>Why Choose AquaFlow?</h2>
//       <p className="subtitle">
//         We provide the best water delivery service with quality and reliability.
//       </p>

//       <div className="features-grid">
//         <div className="feature-card">
//           <h3>Pure & Clean Water</h3>
//           <p>
//             Our water goes through rigorous purification processes to ensure the highest quality.
//           </p>
//         </div>

//         <div className="feature-card">
//           <h3>Fast Delivery</h3>
//           <p>
//             Same-day delivery available. Get your water jars delivered when you need them.
//           </p>
//         </div>

//         <div className="feature-card">
//           <h3>Quality Assured</h3>
//           <p>
//             Regular quality checks and certified processes ensure your safety.
//           </p>
//         </div>

//         <div className="feature-card">
//           <h3>Easy Scheduling</h3>
//           <p>
//             Schedule your deliveries at your convenience. Flexible timing options available.
//           </p>
//         </div>

//         <div className="feature-card">
//           <h3>Jar Return System</h3>
//           <p>
//             Eco-friendly jar return and exchange program. Return empty jars hassle-free.
//           </p>
//         </div>

//         <div className="feature-card">
//           <h3>24/7 Support</h3>
//           <p>
//             Our customer support team is always ready to assist you with any queries.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Features;

// 
// import React from "react";
// import "../styles/features.css";

// import water from "../assets/water.png";
// import delivery from "../assets/delivery.png";
// import quality from "../assets/quality.png";
// import schedule from "../assets/schedule.png";
// import jar from "../assets/return.png";
// import support from "../assets/support.png";

// const Features = () => {
//   const imgStyle = {
//     width: "300px",
//     height: "300px",
//     objectFit: "contain",
//     marginBottom: "15px",
//     display: "block",
//     marginLeft: "auto",
//     marginRight: "auto"
//   };

//   return (
//     <section className="features" id="features">
//       <h2>Why Choose AquaFlow?</h2>
//       <p className="subtitle">
//         We provide the best water delivery service with quality and reliability.
//       </p>

//       <div className="features-grid">

//         <div className="feature-card">
//           <img src={water} alt="Pure Water" style={imgStyle}/>
//           <h3>Pure & Clean Water</h3>
//           <p>
//             Our water goes through rigorous purification processes to ensure the highest quality.
//           </p>
//         </div>

//         <div className="feature-card">
//           <img src={delivery} alt="Fast Delivery" style={imgStyle}/>
//           <h3>Fast Delivery</h3>
//           <p>
//             Same-day delivery available. Get your water jars delivered when you need them.
//           </p>
//         </div>

//         <div className="feature-card">
//           <img src={quality} alt="Quality" style={imgStyle}/>
//           <h3>Quality Assured</h3>
//           <p>
//             Regular quality checks and certified processes ensure your safety.
//           </p>
//         </div>

//         <div className="feature-card">
//           <img src={schedule} alt="Scheduling" style={imgStyle}/>
//           <h3>Easy Scheduling</h3>
//           <p>
//             Schedule your deliveries at your convenience. Flexible timing options available.
//           </p>
//         </div>

//         <div className="feature-card">
//           <img src={jar} alt="Jar Return" style={imgStyle}/>
//           <h3>Jar Return System</h3>
//           <p>
//             Eco-friendly jar return and exchange program. Return empty jars hassle-free.
//           </p>
//         </div>

//         <div className="feature-card">
//           <img src={support} alt="Support" style={imgStyle}/>
//           <h3>24/7 Support</h3>
//           <p>
//             Our customer support team is always ready to assist you with any queries.
//           </p>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Features;

import React from "react";

import water from "../assets/water.png";
import delivery from "../assets/delivery.png";
import quality from "../assets/quality.png";
import schedule from "../assets/schedule.png";
import jar from "../assets/return.png";
import support from "../assets/support.png";

const Features = () => {

  const featuresData = [
    { img: water, title: "Pure & Clean Water", desc: "Our water goes through rigorous purification processes to ensure the highest quality." },
    { img: delivery, title: "Fast Delivery", desc: "Same-day delivery available. Get your water jars delivered when you need them." },
    { img: quality, title: "Quality Assured", desc: "Regular quality checks and certified processes ensure your safety." },
    { img: schedule, title: "Easy Scheduling", desc: "Schedule your deliveries at your convenience. Flexible timing options available." },
    { img: jar, title: "Jar Return System", desc: "Eco-friendly jar return and exchange program. Return empty jars hassle-free." },
    { img: support, title: "24/7 Support", desc: "Our customer support team is always ready to assist you with any queries." },
  ];

  const containerStyle = {
    backgroundColor: "#f0f8ff",
    padding: "80px 20px",
    textAlign: "center",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
  };

  const titleStyle = {
    color: "#0077b6",
    fontSize: "2.5rem",
    marginBottom: "10px"
  };

  const subtitleStyle = {
    color: "#0096c7",
    fontSize: "1.2rem",
    marginBottom: "50px"
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    padding: "25px 15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
    opacity: 0,
    transform: "translateY(15px)",
    animation: "fadeInUp 0.6s forwards"
  };

  const imgStyle = {
    width: "100%",
    maxWidth: "220px",
    height: "auto",
    maxHeight: "220px",
    objectFit: "contain",
    margin: "0 auto 15px",
    display: "block"
  };

  const h3Style = {
    color: "#0077b6",
    fontSize: "1.4rem",
    marginBottom: "10px"
  };

  const pStyle = {
    color: "#023e8a",
    fontSize: "1rem",
    lineHeight: "1.5"
  };

  return (
    <section style={containerStyle} id="features">
      <h2 style={titleStyle}>Why Choose Gurumauli Aqua?</h2>
      <p style={subtitleStyle}>
        We provide the best water delivery service with quality and reliability.
      </p>

      <div style={gridStyle}>
        {featuresData.map((feature, index) => (
          <div key={index} className="feature-card" style={{ ...cardStyle, animationDelay: `${index * 0.15}s` }}
               onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"}
               onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"} 
               onMouseOver={e => e.currentTarget.style.transform = "translateY(-5px)"}
               onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
            <img src={feature.img} alt={feature.title} style={imgStyle} />
            <h3 style={h3Style}>{feature.title}</h3>
            <p style={pStyle}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Inline keyframes animation */}
      <style>
        {`
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
};

export default Features;