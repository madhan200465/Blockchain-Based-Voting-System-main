import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "../contexts/Auth";

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const roleLabel = authContext.isAdmin ? "Election Commission" : "Verified Voter";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authContext.logout();
    }
  };

  if (!authContext.authenticated) {
    return null;
  }

  return (
    <header className="site-navbar" role="banner">
      <div className="navbar-brand" onClick={() => navigate("/")} aria-label="SecureVote dashboard home">
        <div className="brand-mark">
          <i className="bi bi-shield-check"></i>
        </div>
        <div>
          <span className="brand-name">SecureVote</span>
          <span className="brand-subtitle">Blockchain voting console</span>
        </div>
      </div>

      <nav className="navbar-meta" aria-label="Primary user navigation">
        <span className="status-pill">{roleLabel}</span>
        <span className="navbar-user">{authContext.name}</span>
        <button
          className={`button-secondary navbar-action ${pathname === "/profile" ? "active" : ""}`}
          onClick={() => navigate("/profile")}
          aria-label="Open profile"
        >
          <i className="bi bi-person-circle btn-icon" aria-hidden="true"></i>
          <span>Profile</span>
        </button>
        <button className="button-primary navbar-action" onClick={handleLogout} aria-label="Logout">
          <i className="bi bi-power btn-icon" aria-hidden="true"></i>
          <span>Logout</span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
