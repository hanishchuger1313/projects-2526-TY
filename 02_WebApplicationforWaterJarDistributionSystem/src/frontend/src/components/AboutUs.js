// // // import React from "react";
// // // import "./AboutUs.css"; // Optional: for styling

// // // const AboutUs = () => {
// // //   return (
// // //     <div className="about-container">
// // //       <section className="about-hero">
// // //         <h1>About Us</h1>
// // //         <p>Learn more about our mission, vision, and values.</p>
// // //       </section>

// // //       <section className="about-content">
// // //         <div className="about-section">
// // //           <h2>Our Mission</h2>
// // //           <p>
// // //             Our mission is to provide high-quality products and services that
// // //             improve our customers' lives.
// // //           </p>
// // //         </div>

// // //         <div className="about-section">
// // //           <h2>Our Vision</h2>
// // //           <p>
// // //             We envision a world where our solutions make everyday tasks simpler
// // //             and more enjoyable.
// // //           </p>
// // //         </div>

// // //         <div className="about-section">
// // //           <h2>Our Values</h2>
// // //           <ul>
// // //             <li>Integrity</li>
// // //             <li>Innovation</li>
// // //             <li>Customer Satisfaction</li>
// // //             <li>Teamwork</li>
// // //           </ul>
// // //         </div>
// // //       </section>
// // //     </div>
// // //   );
// // // };

// // // export default AboutUs;

// // import React from "react";
// // import "./AboutUs.css";

// // const AboutUs = () => {
// //   return (
// //     <div className="about-page">

// //       {/* HERO */}
// //       <section className="about-hero">
// //         <h1>Gurumauli Aqua</h1>
// //         <p>Pure Water • Trusted Delivery • Healthy Life</p>
// //       </section>

// //       {/* ABOUT IMAGE + TEXT */}
// //       <section className="about-intro">

// //         <div className="about-img">
// //           <img
// //             src="https://images.unsplash.com/photo-1564410267841-915d8e4d71ea"
// //             alt="water"
// //           />
// //         </div>

// //         <div className="about-text">
// //           <h2>Who We Are</h2>
// //           <p>
// //             Gurumauli Aqua provides clean and safe drinking water directly to
// //             your doorstep. Our goal is to ensure every home receives pure,
// //             hygienic and refreshing water with reliable delivery service.
// //           </p>
// //         </div>

// //       </section>

// //       {/* CARDS */}
// //       <section className="about-cards">

// //         <div className="about-card">
// //           <img
// //             src="https://cdn-icons-png.flaticon.com/512/728/728093.png"
// //             alt=""
// //           />
// //           <h3>Pure Water</h3>
// //           <p>We ensure 100% purified and safe drinking water.</p>
// //         </div>

// //         <div className="about-card">
// //           <img
// //             src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
// //             alt=""
// //           />
// //           <h3>Fast Delivery</h3>
// //           <p>Quick doorstep delivery with reliable service.</p>
// //         </div>

// //         <div className="about-card">
// //           <img
// //             src="https://cdn-icons-png.flaticon.com/512/942/942748.png"
// //             alt=""
// //           />
// //           <h3>Trusted Service</h3>
// //           <p>Trusted by many households for quality water supply.</p>
// //         </div>

// //       </section>

// //     </div>
// //   );
// // };

// // export default AboutUs;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./AboutUs.css";

// const AboutUs = () => {

//   const navigate = useNavigate();

//   return (
//     <div className="about-page">

//       {/* BACK BUTTON */}
//       <button className="back-btn" onClick={() => navigate("/")}>
//         ← Back
//       </button>

//       {/* HERO */}
//       <section className="about-hero">
//         <h1>About Gurumauli Aqua</h1>
//         <p>Pure Drinking Water Delivered to Your Doorstep</p>
//       </section>

//       {/* INTRO */}
//       <section className="about-intro">

//         <div className="about-img">
//           <img
//             src="https://cdn-icons-png.flaticon.com/512/2965/2965567.png"
//             alt="water jar"
//           />
//         </div>

//         <div className="about-text">
//           <h2>Who We Are</h2>
//           <p>
//             Gurumauli Aqua provides high quality purified drinking water.
//             Our goal is to ensure safe and hygienic water supply to every
//             household with fast and reliable delivery service.
//           </p>
//         </div>

//       </section>

//       {/* FEATURES */}
//       <section className="about-cards">

//         <div className="about-card">
//           <img src="https://cdn-icons-png.flaticon.com/512/3105/3105792.png" alt="purity"/>
//           <h3>Pure Water</h3>
//           <p>100% purified and hygienic drinking water.</p>
//         </div>

//         <div className="about-card">
//           <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="delivery"/>
//           <h3>Fast Delivery</h3>
//           <p>Quick doorstep jar delivery service.</p>
//         </div>

//         <div className="about-card">
//           <img src="https://cdn-icons-png.flaticon.com/512/942/942748.png" alt="trusted"/>
//           <h3>Trusted Service</h3>
//           <p>Trusted by many families for clean water.</p>
//         </div>

//       </section>

//     </div>
//   );
// };

// export default AboutUs;

import React from "react";
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

import bgImage from "../assets/water.jpg";
import jarImg from "../assets/jar.jpg";
import posterImg from "../assets/poster.jpg";
// ❌ REMOVE video import (important)

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div
      className="about-container"
      style={{
        backgroundImage: `url(${bgImage})`,
        position: "relative",
      }}
    >
      {/* 🔙 Back Button */}
      <button onClick={() => navigate(-1)} className="back-btn">
        ⬅ Back
      </button>

      <div className="overlay">
        <h1 className="about-title">About Gurumauli Aqua</h1>

        <p className="about-text">
          We provide clean and safe drinking water with best quality service.
        </p>

        {/* 🔥 Image Gallery */}
        <div className="image-gallery">
          <div className="card">
            <img src={jarImg} alt="Water Jar" />
            <p>Water Jar</p>
          </div>

          <div className="card">
            <img src={posterImg} alt="Poster" />
            <p>Our Poster</p>
          </div>
        </div>

        {/* 🔥 Video Section */}
        <div className="video-section">
          <h2>Our Process</h2>

          <video
            className="video"
            controls
            width="600"
            preload="auto"
          >
            <source src="/water-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;