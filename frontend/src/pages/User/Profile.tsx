import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../contexts/Auth";

const Profile = () => {
  const navigate = useNavigate();
  const { name, email, citizenshipNumber, voterId, isAdmin, isVerified, logout } = useContext(AuthContext);

  const getDisplayValue = (value?: string | null, fallback: string = "Not available") => {
    const normalized = (value || "").toString().trim();
    return normalized.length > 0 ? normalized : fallback;
  };

  const isValidVoterId = (value?: string | null) => /^[A-Z0-9]{6,24}$/.test((value || "").trim().toUpperCase());

  const displayName = getDisplayValue(name, "User");
  const displayEmail = getDisplayValue(email);
  const displayCitizenship = getDisplayValue(citizenshipNumber);
  const displayVoterId = isAdmin
    ? "Assigned per commission policy"
    : isValidVoterId(voterId)
      ? (voterId || "").trim().toUpperCase()
      : "Pending assignment";
  const roleText = isAdmin ? "Election Commission Admin" : "Voter";
  const accountText = isAdmin
    ? "Election Commission Account"
    : isVerified
      ? "Verified Voter"
      : "Unverified Voter";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <main className="profile-page" aria-labelledby="profile-title">
      <div className="profile-page-heading">
        <h1 id="profile-title">My Profile</h1>
        <p className="text-normal">Manage your election account details</p>
      </div>

      <article className="profile-wrapper" aria-label="Profile overview">
        <header className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar" aria-hidden="true">{initials || "SV"}</div>
            <div className="profile-personal">
              <h2>{displayName}</h2>
              <p>{accountText}</p>
              <div className="profile-org">
                <span className="profile-label">Organization</span>
                <span className="profile-value">Election Commission</span>
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            <button
              type="button"
              className="button-secondary profile-btn"
              onClick={() => navigate("/")}
              aria-label="Back to dashboard"
            >
              <i className="bi bi-chevron-left" aria-hidden="true"></i>
              <span>Back to Dashboard</span>
            </button>
            <button
              type="button"
              className="button-primary profile-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <i className="bi bi-power" aria-hidden="true"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="profile-tagline">
          <i className="bi bi-shield-lock" aria-hidden="true"></i>
          <span>Transparent, tamper-resistant voting for modern election workflows.</span>
        </div>

        <div className="profile-sections">
          <section className="profile-section" aria-labelledby="identity-heading">
            <h3 id="identity-heading">User Identity</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <div className={`profile-value ${displayName === "User" ? "empty" : ""}`}>{displayName}</div>
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <div className={`profile-value ${displayEmail === "Not available" ? "empty" : ""}`}>{displayEmail}</div>
              </div>

              <div className="profile-field">
                <label>Citizenship Number</label>
                <div className={`profile-value ${displayCitizenship === "Not available" ? "empty" : ""}`}>{displayCitizenship}</div>
              </div>

              <div className="profile-field">
                <label>Role</label>
                <div className="profile-value">{roleText}</div>
              </div>
            </div>
          </section>

          <section className="profile-section" aria-labelledby="voting-heading">
            <h3 id="voting-heading">Voting Profile</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Voter ID</label>
                <div className={`profile-value ${displayVoterId === "Pending assignment" ? "empty" : ""}`}>{displayVoterId}</div>
              </div>

              <div className="profile-field">
                <label>Voter Status</label>
                <div className={`profile-status-badge ${isVerified ? "verified" : "pending"}`}>
                  {isVerified ? "Verified" : "Pending Verification"}
                </div>
              </div>

              <div className="profile-field">
                <label>Election Commission</label>
                <div className="profile-value">Election Commission</div>
              </div>
            </div>
            {!isAdmin && !isVerified && (
              <p className="profile-data-note text-normal">
                Your verification is pending. Voter ID and access to election actions may update after approval.
              </p>
            )}
          </section>
        </div>

        <div className="profile-readonly-row">
          <span className="text-normal">Read-only profile</span>
          <button type="button" className="button-secondary edit-profile-btn" disabled aria-label="Edit profile unavailable">
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
            <span>Edit Profile</span>
          </button>
        </div>
      </article>
    </main>
  );
};

export default Profile;
