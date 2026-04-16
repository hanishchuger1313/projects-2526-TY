import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Shield, Zap, BarChart, FileText, 
  CheckCircle, Users, Clock, ChevronRight, Sparkles
} from "lucide-react";
import "../Styles/Home.css";
import testcase from "../Assets/testcases.jpg";
import ai from "../Assets/ai-processing.png";
import quality from "../Assets/quality-check.jpg";
import logo from "../Assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 1000,
    testCases: 50000,
    projects: 250,
    accuracy: 95
  });
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced NLP algorithms analyze SRS documents with human-like understanding",
      icon: "🤖"
    },
    {
      title: "Automated Validation",
      description: "Validate requirements for completeness, clarity, and testability",
      icon: "✅"
    },
    {
      title: "Smart Test Generation",
      description: "Generate comprehensive test cases covering all scenarios",
      icon: "⚡"
    },
    {
      title: "Multi-Format Export",
      description: "Export test cases to Excel, PDF, CSV, and Markdown formats",
      icon: "📤"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "QA Lead at TechCorp",
      text: "Reduced our test planning time by 70%. The AI understands requirements better than some of our junior testers!",
      rating: 5
    },
    {
      name: "Raj Patel",
      role: "Software Architect",
      text: "The validation feature alone has improved our requirements quality by 40%. Essential tool for any agile team.",
      rating: 5
    },
    {
      name: "Maria Gonzalez",
      role: "Product Manager",
      text: "Bridge the gap between requirements and testing. Our development cycle is now 2 weeks faster.",
      rating: 4
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <nav className="navbar">
          <div className="nav-logo">
            <img src={logo} alt="STCG Logo" className="logo" />
            <span className="logo-text">STCG</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Testimonials</a>
            <button 
              className="nav-button"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">
              <Sparkles size={16} />
              <span>AI-Powered Test Automation</span>
            </div>
            
            <h1 className="hero-title">
              Generate Comprehensive Test Cases
              <span className="gradient-text"> From SRS Documents</span>
            </h1>
            
            <p className="hero-subtitle">
              Transform Software Requirements Specifications into actionable test cases 
              in minutes using advanced AI. Reduce manual effort by 80% and improve 
              test coverage by 40%.
            </p>
            
            <div className="hero-actions">
              <button 
                className="primary-button"
                onClick={() => navigate("/auth")}
              >
                Start Generating Free
                <Zap size={20} />
              </button>
              <button className="secondary-button">
                <FileText size={20} />
                View Demo
              </button>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Test Cases Generated</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">250+</div>
                <div className="stat-label">Projects</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="feature-card active">
              <div className="feature-icon">{features[currentFeature].icon}</div>
              <h3>{features[currentFeature].title}</h3>
              <p>{features[currentFeature].description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose STCG?</h2>
          <p className="section-subtitle">
            Comprehensive test automation powered by cutting-edge AI technology
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow Section */}
      <section id="how-it-works" className="flow-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps from requirements to test cases
          </p>
        </div>

        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <div className="step-icon">📄</div>
              <h3>Upload SRS Document</h3>
              <p>
                Upload your Software Requirements Specification document 
                (PDF, DOCX, or TXT format). Our AI will extract and analyze 
                all requirements automatically.
              </p>
            </div>
          </div>

          <div className="flow-arrow">
            <ChevronRight size={32} />
          </div>

          <div className="flow-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <div className="step-icon">🤖</div>
              <h3>AI Analysis & Validation</h3>
              <p>
                Our AI validates each requirement for completeness, clarity, 
                and testability. Get instant feedback on requirement quality 
                with actionable suggestions.
              </p>
            </div>
          </div>

          <div className="flow-arrow">
            <ChevronRight size={32} />
          </div>

          <div className="flow-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <div className="step-icon">✅</div>
              <h3>Generate Test Cases</h3>
              <p>
                Automatically generate comprehensive test cases covering 
                positive, negative, and boundary scenarios. Export in multiple 
                formats ready for your test management tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Trusted by Testing Teams</h2>
          <p className="section-subtitle">
            See what industry professionals say about STCG
          </p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {"★".repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Testing Process?</h2>
          <p>
            Join thousands of testers and developers who have automated 
            their test case generation with STCG.
          </p>
          <button 
            className="cta-button"
            onClick={() => navigate("/auth")}
          >
            Start Free Trial
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="STCG Logo" className="logo" />
            <span className="logo-text">STCG</span>
            <p className="footer-tagline">
              AI-powered test case generation for modern software teams
            </p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#api">API</a>
            </div>
            
            <div className="link-group">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#support">Support</a>
              <a href="#community">Community</a>
              <a href="#status">Status</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 STCG. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;