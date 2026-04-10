import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import LoginLayout from "../layouts/Login";
import * as Yup from "yup";
import axios from "../axios";
import BiometricScanner from "../components/Auth/BiometricScanner";

const schema = Yup.object().shape({
  name: Yup.string().min(3).required(),
  citizenshipNumber: Yup.string().min(4).required(),
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
      const dummyEmail = `${signupData.citizenshipNumber}@voter.local`;
      axios
        .post("/auth/signup", {
          ...signupData,
          email: dummyEmail,
        })
        .then((res) => {
          setError("");
          setSuccess("Registration Request Submitted! Please wait for Election Commission approval.");
          setShowBiometrics(false);
          setSignupData(null);
        })
        .catch((err) => {
          let error: string = err.message;
          if (err?.response?.data)
            error = JSON.stringify(err.response.data);
          setError(error.slice(0, 50));
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
              citizenshipNumber: "",
              password: "",
              confirm: "",
            }}
            validationSchema={schema}
            onSubmit={(values) => {
              setSignupData(values);
              setShowBiometrics(true);
            }}
          >
            {({ errors, touched, getFieldProps, handleSubmit }) => (
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
                    id="citizenshipNumber"
                    type="text"
                    placeholder="Citizenship Number"
                    {...getFieldProps("citizenshipNumber")}
                  />
                  <div className="form-error-text">
                    {touched.citizenshipNumber && errors.citizenshipNumber
                      ? errors.citizenshipNumber
                      : null}
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
