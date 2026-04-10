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
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <div className="title-small">Blockchain Powered</div>
          <h1 className="title-large">Future of Digital Voting</h1>
          <p className="text-normal">
            A secure, transparent, and decentralized platform ensuring every vote
            is counted and immutable.
          </p>
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
