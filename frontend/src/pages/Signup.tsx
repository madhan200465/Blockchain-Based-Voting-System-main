import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import LoginLayout from "../layouts/Login";
import * as Yup from "yup";
import axios from "../axios";
import BiometricScanner from "../components/Auth/BiometricScanner";

const schema = Yup.object().shape({
  name: Yup.string().min(3).required(),
  email: Yup.string().email("Please enter a valid email").required("Email is required"),
  govtIdType: Yup.string().oneOf(["aadhaar", "voter", "passport", "driving-license", "other"]).required("Document type is required"),
  govtIdFile: Yup.mixed().required("Government ID file is required"),
  phoneNumber: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  aadhaarNumber: Yup.string()
    .matches(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits")
    .required("Aadhaar number is required"),
  address: Yup.string().min(5, "Address is too short").required("Address is required"),
  password: Yup.string().min(3).required("Required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "must be same as password")
    .required(),
});

const Signup = (): JSX.Element => {
  const navigate = useNavigate();

  const [error, setError] = useState<any>("");
  const [success, setSuccess] = useState<string>("");
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);

  const handleBiometricEnrollment = () => {
    if (signupData) {
      setError("");
      setSuccess("");

      const payload = new FormData();
      payload.append("name", signupData.name);
      payload.append("email", signupData.email);
      payload.append("govtIdType", signupData.govtIdType);
      payload.append("phoneNumber", signupData.phoneNumber);
      payload.append("aadhaarNumber", signupData.aadhaarNumber);
      payload.append("address", signupData.address);
      payload.append("password", signupData.password);

      if (signupData.citizenshipNumber) {
        payload.append("citizenshipNumber", signupData.citizenshipNumber);
      }

      if (signupData.govtIdFile) {
        payload.append("govtIdFile", signupData.govtIdFile);
      }

      axios
        .post("/auth/signup", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setError("");
          setSuccess("Registration Request Submitted! Please wait for Election Commission approval.");
          setShowBiometrics(false);
          setSignupData(null);
        })
        .catch((err) => {
          const responseData = err?.response?.data;
          let message = "Registration failed. Please check your details and try again.";

          const toFriendlyMessage = (raw: string) => {
            const lower = raw.toLowerCase();

            if (lower.includes("body.email") && lower.includes("valid email")) {
              return "Please enter a valid email address.";
            }
            if (lower.includes("body.name")) {
              return "Please enter your full name (minimum 3 characters).";
            }
            if (lower.includes("body.govtidtype")) {
              return "Please choose a government ID type.";
            }
            if (lower.includes("government id document is required")) {
              return "Please upload your government ID document.";
            }
            if (lower.includes("unsupported file format")) {
              return "Unsupported file format. Upload JPG, PNG, or PDF only.";
            }
            if (lower.includes("body.citizenshipnumber")) {
              return "Please enter a valid citizenship number (minimum 4 characters).";
            }
            if (lower.includes("body.phonenumber")) {
              return "Please enter a valid phone number.";
            }
            if (lower.includes("body.aadhaarnumber")) {
              return "Please enter a valid 12-digit Aadhaar number.";
            }
            if (lower.includes("body.address")) {
              return "Please enter your full address.";
            }
            if (lower.includes("body.password")) {
              return "Password must be at least 3 characters.";
            }

            return raw;
          };

          if (Array.isArray(responseData) && responseData.length > 0) {
            message = toFriendlyMessage(String(responseData[0]));
          } else if (typeof responseData === "string" && responseData.trim() !== "") {
            message = toFriendlyMessage(responseData);
          } else if (responseData?.message) {
            message = toFriendlyMessage(String(responseData.message));
          } else if (responseData?.error?.message) {
            message = toFriendlyMessage(String(responseData.error.message));
          } else if (err?.message) {
            message = String(err.message);
          }

          setSuccess("");
          setError(message.slice(0, 120));
          setShowBiometrics(false);
        });
    }
  };

  return (
    <div>
      {showBiometrics && (
        <BiometricScanner
          voterName={signupData?.name}
          onSuccess={handleBiometricEnrollment}
          onCancel={() => setShowBiometrics(false)}
        />
      )}
      <LoginLayout error={error} success={success}>
        <div className="form-container">
          <Formik
            initialValues={{
              name: "",
              email: "",
              govtIdType: "",
              govtIdFile: null,
              phoneNumber: "",
              aadhaarNumber: "",
              address: "",
              citizenshipNumber: "",
              password: "",
              confirm: "",
            }}
            validationSchema={schema}
            onSubmit={(values) => {
              setError("");
              setSuccess("");
              setSignupData(values);
              setShowBiometrics(true);
            }}
          >
            {({ errors, touched, getFieldProps, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit}>
                <div className="input-container">
                  <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    {...getFieldProps("name")}
                  />
                  <div className="form-error-text">
                    {touched.name && errors.name ? errors.name : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...getFieldProps("email")}
                  />
                  <div className="form-error-text">
                    {touched.email && errors.email ? errors.email : null}
                  </div>
                </div>

                <div className="input-container">
                  <select id="govtIdType" {...getFieldProps("govtIdType")}>
                    <option value="">Select Government ID Type</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="voter">Voter ID</option>
                    <option value="passport">Passport</option>
                    <option value="driving-license">Driving License</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="form-error-text">
                    {touched.govtIdType && errors.govtIdType ? String(errors.govtIdType) : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="govtIdFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] || null;
                      setFieldValue("govtIdFile", file);
                    }}
                  />
                  <div className="form-info-text" style={{ marginTop: "6px" }}>
                    Allowed: JPG, PNG, PDF (max 5MB)
                  </div>
                  <div className="form-error-text">
                    {touched.govtIdFile && errors.govtIdFile ? String(errors.govtIdFile) : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="citizenshipNumber"
                    type="text"
                    placeholder="Citizenship Number (optional)"
                    {...getFieldProps("citizenshipNumber")}
                  />
                  <div className="form-error-text">
                    {touched.citizenshipNumber && errors.citizenshipNumber
                      ? String(errors.citizenshipNumber)
                      : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="phoneNumber"
                    type="text"
                    placeholder="Phone Number"
                    {...getFieldProps("phoneNumber")}
                  />
                  <div className="form-error-text">
                    {touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="aadhaarNumber"
                    type="text"
                    placeholder="Aadhaar Number (12 digits)"
                    {...getFieldProps("aadhaarNumber")}
                  />
                  <div className="form-error-text">
                    {touched.aadhaarNumber && errors.aadhaarNumber ? errors.aadhaarNumber : null}
                  </div>
                </div>

                <div className="input-container">
                  <input
                    id="address"
                    type="text"
                    placeholder="Address"
                    {...getFieldProps("address")}
                  />
                  <div className="form-error-text">
                    {touched.address && errors.address ? errors.address : null}
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

                <div className="input-container">
                  <input
                    id="confirm"
                    type="password"
                    placeholder="Confirm Password"
                    {...getFieldProps("confirm")}
                  />
                  <div className="form-error-text">
                    {touched.confirm && errors.confirm ? errors.confirm : null}
                  </div>
                </div>

                <button className="button-primary" type="submit">
                  Create a New Account
                </button>
              </form>
            )}
          </Formik>

          <hr />
          <div className="form-info-text">Already have an account?</div>

          <button
            onClick={() => navigate("/login")}
            className="button-secondary"
            type="button"
          >
            Login
          </button>
        </div>
      </LoginLayout>
    </div>
  );
};

export default Signup;
