import React from "react";
import { useNavigate } from "react-router";
import BackButton from "../components/Back";

interface LayoutProps {
  error: string;
  success?: string;
  children: JSX.Element;
}

const Login = (props: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="login-layout-wrapper">
      <div className="left">
        <BackButton call={() => navigate("/")} />

        <div className="title-small">Secure access layer</div>
        <div className="title-large">Blockchain Based</div>
        <div className="title-large">Voting System</div>
        <p className="text-normal login-copy">
          Designed for verified voting, auditability, and a clear separation between voter and commission workflows.
        </p>

        <div className="login-highlights">
          <div>
            <strong>Immutable</strong>
            <span>Election records</span>
          </div>
          <div>
            <strong>Verified</strong>
            <span>Identity checks</span>
          </div>
          <div>
            <strong>Auditable</strong>
            <span>Live result flow</span>
          </div>
        </div>
      </div>

      <div className="right">
        {props.error !== "" ? (
          <div className="error-message">
            <span>
              <i className="bi bi-exclamation-circle"></i>
            </span>
            <span>{props.error} ...</span>
          </div>
        ) : null}

        {props.success && props.success !== "" ? (
          <div className="success-message">
            <span>
              <i className="bi bi-check-circle"></i>
            </span>
            <span>{props.success} ...</span>
          </div>
        ) : null}

        <div className="auth-panel">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Login;
