// import React from "react";
// import "../styles/Navbar.css";

// const Navbar = () => {
//   const scrollToSection = (id) => {
//     const section = document.getElementById(id);
//     if (section) {
//       section.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-container">
//         <h2 className="logo">Gurumauli Aqua</h2>

//         <ul className="nav-links">
//           <li onClick={() => scrollToSection("hero")}>Home</li>
//           <li onClick={() => scrollToSection("features")}>Why Gurumauli Aqua</li>
//             <li onClick={() => scrollToSection("about us")}>About Us</li>
//               <li onClick={() => scrollToSection("contact")}>Contact</li>
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// import React from "react";
// import "../styles/Navbar.css";

// const Navbar = () => {

//   const scrollToSection = (id) => {
//     const section = document.getElementById(id);
//     if (section) {
//       section.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <nav className="navbar">
//       <div className="nav-container">
//         <h2 className="logo">Gurumauli Aqua</h2>

//         <ul className="nav-links">
//           {/* <li onClick={() => scrollToSection("hero")}>Home</li>
//           <li onClick={() => scrollToSection("features")}>Why Gurumauli Aqua</li>
//           <li onClick={() => scrollToSection("about")}>About Us</li>
//           <li onClick={() => scrollToSection("contact")}>Contact</li> */}

//           <li onClick={() => scrollToSection("hero")}>Home</li>
//           <li onClick={() => scrollToSection("features")}>Why Gurumauli Aqua</li>
//           <li onClick={() => scrollToSection("about")}>About Us</li>
//           <li onClick={() => scrollToSection("contact")}>Contact</li>

//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        <h1 className="logo">Gurumauli Aqua</h1>

        <ul className="nav-links">
          <li onClick={() => scrollToSection("hero")}>Home</li>

          <li onClick={() => scrollToSection("features")}>
            Why Gurumauli Aqua
          </li>

          <li>
            <Link to="/about" style={{ color: "inherit", textDecoration: "none" }}>
              About Us
            </Link>
            
          </li>

          <li onClick={() => scrollToSection("contact")}>
            Contact
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;