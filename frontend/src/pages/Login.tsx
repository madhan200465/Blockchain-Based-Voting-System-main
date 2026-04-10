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

  const [error, setError] = useState<any>("");
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const loginSchema = Yup.object().shape({
    email: props.type === "admin" ? Yup.string().email("Invalid email").required("Required") : Yup.string(),
    voterId: props.type === "voter" ? Yup.string().required("Required") : Yup.string(),
    password: Yup.string().min(3).required("Required"),
  });

  const handleBiometricSuccess = () => {
    if (tempAuthData) {
      if (props.type === "voter" && !tempAuthData.user.verified) {
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
            {props.type === "admin" ? "Election Commission Portal" : "Voter Portal"}
          </div>
          <Formik
            initialValues={{
              email: "",
              voterId: "",
              password: "",
            }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              setError(""); // Clear previous errors
              axios
                .post("/auth/login", { ...values })
                .then((res) => {
                  // Role check for security
                  if (props.type === "admin" && !res.data.user.admin) {
                    setError("Unauthorized: This portal is for Commission Members only.");
                    return;
                  }
                  if (props.type === "voter" && res.data.user.admin) {
                    setError("Unauthorized: Please use the Commission Portal.");
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
                  {props.type === "admin" ? (
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...getFieldProps("email")}
                    />
                  ) : (
                    <input
                      id="voterId"
                      type="text"
                      placeholder="Voter ID (Citizenship Number)"
                      {...getFieldProps("voterId")}
                    />
                  )}
                  <div className="form-error-text">
                    {props.type === "admin"
                      ? (touched.email && errors.email ? errors.email : null)
                      : (touched.voterId && errors.voterId ? errors.voterId : null)
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
                  {props.type === "admin" ? "Verify & Enter" : "Login"}
                </button>
              </form>
            )}
          </Formik>

          {props.type !== "admin" && (
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
