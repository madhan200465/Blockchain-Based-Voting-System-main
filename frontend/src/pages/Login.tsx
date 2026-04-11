import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import { RouteProps } from "react-router";
import LoginLayout from "../layouts/Login";
import * as Yup from "yup";
import axios from "../axios";
import { AuthContext } from "../contexts/Auth";
import BiometricScanner from "../components/Auth/BiometricScanner";

interface LoginProps extends RouteProps {
  type?: "voter" | "admin";
}

const Login = (props: RouteProps & LoginProps): JSX.Element => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAdminMode = props.type === "admin";
  const isVoterMode = props.type === "voter";
  const isMixedMode = !isAdminMode && !isVoterMode;

  const [error, setError] = useState<any>("");
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const loginSchema = Yup.object().shape({
    email: isAdminMode ? Yup.string().email("Invalid email").required("Required") : Yup.string(),
    voterId: isVoterMode ? Yup.string().required("Required") : Yup.string(),
    credential: isMixedMode ? Yup.string().trim().required("Required") : Yup.string(),
    password: Yup.string().min(3).required("Required"),
  });

  const handleBiometricSuccess = () => {
    if (tempAuthData) {
      if ((isVoterMode || isMixedMode) && !tempAuthData.user.verified) {
        setError("Account Pending Approval: Please contact the Election Commission for verification.");
        setShowBiometrics(false);
        return;
      }
      authContext.authenticate(tempAuthData.user, tempAuthData.accessToken);
      setShowBiometrics(false);
    }
  };

  return (
    <div>
      {showBiometrics && (
        <BiometricScanner
          voterName={tempAuthData?.user?.name}
          onSuccess={handleBiometricSuccess}
          onCancel={() => setShowBiometrics(false)}
        />
      )}
      <LoginLayout error={error}>
        <div className="form-container">
          <div className="title-small" style={{ marginBottom: "20px", textAlign: "center" }}>
            {isAdminMode ? "Election Commission Portal" : isVoterMode ? "Voter Portal" : "Secure Login Portal"}
          </div>
          <Formik
            initialValues={{
              email: "",
              voterId: "",
              credential: "",
              password: "",
            }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              setError(""); // Clear previous errors
              const credential = values.credential.trim();
              const payload =
                isAdminMode
                  ? {
                      email: values.email.trim(),
                      password: values.password,
                    }
                  : isVoterMode
                  ? {
                      voterId: values.voterId.trim(),
                      password: values.password,
                    }
                  : credential.includes("@")
                  ? {
                      email: credential,
                      password: values.password,
                    }
                  : {
                      voterId: credential,
                      password: values.password,
                    };

              axios
                .post("/auth/login", payload)
                .then((res) => {
                  // Role check for security
                  if (isAdminMode && !res.data.user.admin) {
                    setError("This account is a voter account. Redirecting to Voter Portal...");
                    setTimeout(() => navigate("/login/voter"), 800);
                    return;
                  }
                  if (isVoterMode && res.data.user.admin) {
                    setError("This account is a Commission account. Redirecting to Commission Portal...");
                    setTimeout(() => navigate("/login/admin"), 800);
                    return;
                  }

                  // Store data and trigger biometrics
                  setTempAuthData(res.data);
                  setShowBiometrics(true);
                })
                .catch((err) => {
                  // Handle unverified user flow (Pillar 1)
                  if (err.response?.status === 403 && err.response?.data?.needsVerification) {
                      setTempAuthData(err.response.data);
                      setShowBiometrics(true);
                      return;
                  }

                  let errorMsg = err.response?.data || err.message;
                  if (typeof errorMsg === "object") errorMsg = JSON.stringify(errorMsg);
                  setError(errorMsg.toString().slice(0, 100)); // Clean error display
                });
            }}
          >
            {({ errors, touched, getFieldProps, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <div className="input-container">
                  {isAdminMode ? (
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...getFieldProps("email")}
                    />
                  ) : isVoterMode ? (
                    <input
                      id="voterId"
                      type="text"
                      placeholder="Voter ID (Citizenship Number)"
                      {...getFieldProps("voterId")}
                    />
                  ) : (
                    <input
                      id="credential"
                      type="text"
                      placeholder="Email or Voter ID"
                      {...getFieldProps("credential")}
                    />
                  )}
                  <div className="form-error-text">
                    {isAdminMode
                      ? (touched.email && errors.email ? errors.email : null)
                      : isVoterMode
                      ? (touched.voterId && errors.voterId ? errors.voterId : null)
                      : (touched.credential && errors.credential ? errors.credential : null)
                    }
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...getFieldProps("password")}
                  />
                  <div className="form-error-text">
                    {touched.password && errors.password
                      ? errors.password
                      : null}
                  </div>
                </div>

                <button className="login-button button-primary" type="submit">
                  {isAdminMode ? "Verify & Enter" : "Login"}
                </button>
              </form>
            )}
          </Formik>

          {!isAdminMode && (
            <>
              <hr />
              <button
                onClick={() => navigate("/signup")}
                className="button-secondary"
              >
                Create a New Account
              </button>
            </>
          )}
        </div>
      </LoginLayout>
    </div>
  );
};

export default Login;
