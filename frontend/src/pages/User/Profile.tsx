import React, { useContext } from "react";
import { RouteProps } from "react-router";
import { AuthContext } from "../../contexts/Auth";

const Profile = (props: RouteProps) => {
  const { name, email, citizenshipNumber, isAdmin, isVerified, logout } = useContext(AuthContext);

  return (
    <div className="profile-wrapper">
      <div className="left-panel">
        <div className="person-icon">
          <i className="bi bi-person-circle"></i>
        </div>
        <div className="text-normal username">{name}</div>
        <div className="role-badge">{isAdmin ? "Election Commission" : "Verified Voter"}</div>
        <button onClick={logout} className="button-primary logout-btn">
          Logout
        </button>
      </div>

      <div className="right-panel">
        <span className="title-small">Account Information</span>

        <div className="profile-field">
          <label>Full Name</label>
          <div className="profile-value">{name}</div>
        </div>

        {isAdmin && (
          <div className="profile-field">
            <label>Email Address</label>
            <div className="profile-value">{email}</div>
          </div>
        )}

        <div className="profile-field">
          <label>Citizenship Number</label>
          <div className="profile-value">{citizenshipNumber}</div>
        </div>

        <div className="profile-field">
          <label>Voter Status</label>
          <div className={`profile-value status-${isVerified ? 'success' : 'pending'}`}>
            {isVerified ? "✅ Verified" : "⏳ Pending Verification"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
