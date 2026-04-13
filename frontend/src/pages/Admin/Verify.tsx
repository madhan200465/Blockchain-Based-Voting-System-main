import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import axios from "../../axios";

type UserPreview = {
  id: number;
  name: string;
  email: string;
  citizenshipNumber: string | null;
  phoneNumber: string | null;
  aadhaarNumber: string | null;
  address: string | null;
  govtIdType: string | null;
  govtIdPath: string | null;
  govtIdUrl: string | null;
  voterId: string | null;
  verified: boolean;
};

const Verify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    axios
      .get(`/users/preview/${id}`)
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setError("Unable to load user details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const toErrorMessage = (error: any, fallback: string) => {
    const responseData = error?.response?.data;

    if (Array.isArray(responseData) && responseData.length > 0) {
      return String(responseData[0]);
    }

    if (typeof responseData === "string" && responseData.trim() !== "") {
      return responseData;
    }

    if (responseData?.message) {
      return String(responseData.message);
    }

    return fallback;
  };

  const maskAadhaar = (aadhaar: string | null | undefined) => {
    if (!aadhaar) {
      return "Not provided";
    }

    const trimmed = aadhaar.trim();

    if (trimmed.length < 4) {
      return "************";
    }

    return `XXXXXXXX${trimmed.slice(-4)}`;
  };

  const getInitials = (fullName: string | null | undefined) => {
    if (!fullName) {
      return "VR";
    }

    const parts = fullName
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) {
      return "VR";
    }

    return parts.map((part) => part[0].toUpperCase()).join("");
  };

  const canInlinePreview = (url: string | null | undefined) => {
    if (!url) {
      return false;
    }

    const lower = url.toLowerCase();
    return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
  };

  const verifyUser = () => {
    if (!id) {
      setError("Invalid user id.");
      return;
    }

    setProcessing(true);
    axios
      .post("/users/verify", { userId: id })
      .then(() => navigate("/users"))
      .catch((err) => setError(toErrorMessage(err, "Could not verify this voter.")))
      .finally(() => setProcessing(false));
  };

  const deleteUser = () => {
    if (!id) {
      setError("Invalid user id.");
      return;
    }

    setProcessing(true);
    axios
      .delete(`/users/delete/${id}`)
      .then(() => navigate("/users"))
      .catch((err) => setError(toErrorMessage(err, "Could not reject this request.")))
      .finally(() => setProcessing(false));
  };

  if (loading) {
    return <div className="loading-state">Loading user preview...</div>;
  }

  if (error && !user) {
    return (
      <div className="admin-dashboard-container">
        <div className="dashboard-header">
          <h2 className="title-small">Voter Verification Preview</h2>
          <p className="text-normal">{error}</p>
          <button className="button-secondary" onClick={() => navigate("/users")}>
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container verify-page-container">
      <div className="verify-header-strip">
        <button onClick={() => navigate("/users")} className="button-secondary" disabled={processing}>
          <i className="bi bi-arrow-left"></i>
          Back to Requests
        </button>
        <div className={`verify-status-chip ${user?.verified ? "verified" : "pending"}`}>
          <i className={`bi ${user?.verified ? "bi-patch-check" : "bi-hourglass-split"}`}></i>
          {user?.verified ? "Verified" : "Pending Verification"}
        </div>
      </div>

      <div className="verify-hero card-premium">
        <div className="verify-avatar">{getInitials(user?.name)}</div>
        <div className="verify-hero-copy">
          <h2 className="title-small">Voter Verification Review</h2>
          <h3>{user?.name || "Unknown voter"}</h3>
          <p className="text-normal">Carefully review submitted details before approval.</p>
        </div>
      </div>

      {error ? <p className="verify-inline-error">{error}</p> : null}

      <div className="verify-grid">
        <div className="verify-detail-card card-premium">
          <h4>
            <i className="bi bi-person-vcard"></i>
            Identity Information
          </h4>

          <div className="detail-row">
            <span>Email</span>
            <strong>{user?.email || "Not provided"}</strong>
          </div>

          <div className="detail-row">
            <span>Phone Number</span>
            <strong>{user?.phoneNumber || "Not provided"}</strong>
          </div>

          <div className="detail-row">
            <span>Aadhaar</span>
            <strong>{maskAadhaar(user?.aadhaarNumber)}</strong>
          </div>

          <div className="detail-row">
            <span>Citizenship (optional)</span>
            <strong>{user?.citizenshipNumber || "Not provided"}</strong>
          </div>

          <div className="detail-row">
            <span>Address</span>
            <strong>{user?.address || "Not provided"}</strong>
          </div>

          <div className="detail-row">
            <span>Current Voter ID</span>
            <strong>{user?.voterId || "Not assigned yet"}</strong>
          </div>

          <div className="detail-row">
            <span>Government ID Type</span>
            <strong>{user?.govtIdType || "Not provided"}</strong>
          </div>

          <div className="detail-row detail-row-doc">
            <span>Government ID Document</span>
            <strong>
              {user?.govtIdUrl ? (
                <a href={user.govtIdUrl} target="_blank" rel="noreferrer" className="verify-doc-link">
                  Open Uploaded Document
                </a>
              ) : (
                "Not uploaded"
              )}
            </strong>
          </div>

          {canInlinePreview(user?.govtIdUrl) ? (
            <div className="verify-doc-preview">
              <img src={user?.govtIdUrl || ""} alt="Uploaded government ID" />
            </div>
          ) : null}
        </div>

        <div className="verify-warning-card card-premium">
          <h4>
            <i className="bi bi-shield-exclamation"></i>
            Verification Checklist
          </h4>
          <ul>
            <li>Confirm email and phone number belong to the registrant.</li>
            <li>Validate Aadhaar identity through your approval process.</li>
            <li>Check address and identity details for inconsistencies.</li>
            <li>Approve only after manual verification is complete.</li>
          </ul>
        </div>
      </div>

      <div className="verify-action-bar">
        <button onClick={verifyUser} className="button-primary" disabled={processing || user?.verified}>
          <i className="bi bi-check2-circle"></i>
          {processing ? "Processing..." : "Approve"}
        </button>
        <button onClick={deleteUser} className="button-black" disabled={processing}>
          <i className="bi bi-x-circle"></i>
          {processing ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
};

export default Verify;
