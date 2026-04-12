import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">
          <img src="logo.png" alt="logo" />
          <span>SecureVote</span>
        </div>
        <div className="landing-header-actions">
          <a href="#features" className="nav-link">How it works</a>
          <Link to="/login/admin" className="nav-link">Commission portal</Link>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">Blockchain powered election infrastructure</div>
          <div className="title-small">Digital voting, engineered for trust</div>
          <h1 className="title-large">Future of Digital Voting</h1>
          <p className="text-normal hero-copy">
            A secure, transparent, and decentralized platform ensuring every vote is counted, traceable, and immutable.
          </p>

          <div className="hero-actions">
            <Link to="/login/voter">
              <button className="button-primary">Enter Voter Portal</button>
            </Link>
            <Link to="/signup">
              <button className="button-secondary">Register New Voter</button>
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>End-to-end</strong>
              <span>Voter verification</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Ballot status visibility</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Blockchain-backed records</span>
            </div>
          </div>
        </div>

        <div className="portal-cards">
          <div className="portal-card voter-card">
            <div className="icon-wrapper">
              <i className="bi bi-person-check-fill"></i>
            </div>
            <h3>Voter Portal</h3>
            <p>Enter the secure voting chamber to cast your vote using your blockchain identity.</p>
            <Link to="/login/voter">
              <button className="button-primary">Voter Login</button>
            </Link>
            <Link to="/signup" className="signup-link">New Voter? Register Here</Link>
          </div>

          <div className="portal-card admin-card">
            <div className="icon-wrapper">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h3>Election Commission</h3>
            <p>Official access for managing elections, verifying voters, and monitoring system status.</p>
            <Link to="/login/admin">
              <button className="button-black">Commission Login</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
