import React from "react";

const Contact = () => {

  const sectionStyle = {
    padding: "60px 20px",
    textAlign: "center",
    background: "linear-gradient(135deg, #6dd5ed, #2193b0)",
    color: "white",
    borderRadius: "15px"
  };

  const titleStyle = {
    fontSize: "36px",
    marginBottom: "10px",
    textShadow: "2px 2px rgba(0,0,0,0.2)"
  };

  const subtitleStyle = {
    fontSize: "18px",
    marginBottom: "40px",
    opacity: 0.9
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "30px",
    maxWidth: "900px",
    margin: "0 auto"
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "20px",
    borderRadius: "12px",
    transition: "transform 0.3s, boxShadow 0.3s",
    cursor: "pointer"
  };

  const cardHover = (e) => {
    e.currentTarget.style.transform = "translateY(-10px)";
    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
  };

  const cardLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };

  const cardTitleStyle = {
    fontSize: "20px",
    marginBottom: "10px"
  };

  const cardTextStyle = {
    fontSize: "16px",
    opacity: 0.9
  };

  return (
    <section style={sectionStyle} id="contact">
      <h2 style={titleStyle}>Contact Us</h2>
      <p style={subtitleStyle}>Have questions? Reach out to us anytime.</p>

      <div style={gridStyle}>
        <div style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
          <h4 style={cardTitleStyle}>Phone</h4>
          <p style={cardTextStyle}>+91 9850231525</p>
        </div>

        <div style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
          <h4 style={cardTitleStyle}>Email</h4>
          <p style={cardTextStyle}>Gurumauli@google.com</p>
        </div>

        <div style={cardStyle} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
          <h4 style={cardTitleStyle}>Address</h4>
          <p style={cardTextStyle}>Gulab Bhau Nagar Mohadi Upnagar Dhule</p>
        </div>
      </div>
    </section>
  );
};

export default Contact;