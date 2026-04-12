import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "../axios";

type ContextProps = {
  children: JSX.Element;
};

type User = {
  id: number;
  name: string;
  email: string;
  citizenshipNumber: string;
  voterId: string | null;
  admin: boolean;
  verified: boolean;
};

export const AuthContext = createContext({
  id: 0,
  name: "",
  email: "",
  citizenshipNumber: "",
  voterId: "",
  isAdmin: false,
  isVerified: false,
  authenticated: false,
  accessToken: "",
  loading: true,
  authenticate: (user: User, token: string) => { },
  logout: () => { },
});

const AuthProvider = (props: ContextProps): JSX.Element => {
  const navigate = useNavigate();

  const [authentication, setAuthentication] = useState({
    id: 0,
    name: "",
    email: "",
    citizenshipNumber: "",
    voterId: "",
    isAdmin: false,
    isVerified: false,
    authenticated: false,
    accessToken: "",
    loading: true,
  });

  const authenticate = useCallback((
    user: User,
    token: string,
    redirect: boolean = true
  ) => {
    // Immediate axios sync
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setAuthentication({
      id: user.id,
      name: user.name,
      email: user.email,
      citizenshipNumber: user.citizenshipNumber,
      voterId: user.voterId || "",
      isAdmin: user.admin,
      isVerified: user.verified,
      authenticated: true,
      accessToken: token,
      loading: false,
    });

    if (redirect) navigate("/");
  }, [navigate]);

  const checkAuthentication = useCallback(() => {
    axios
      .post("/auth/check")
      .then((res) => authenticate(res.data.user, res.data.accessToken, false))
      .catch((error) => {
        console.log(error);
        setAuthentication((prev) => ({ ...prev, loading: false }));
      });
  }, [authenticate]);

  useEffect(() => {
    checkAuthentication();

    const interval = setInterval(checkAuthentication, 30 * 1000);

    return () => clearInterval(interval);
  }, [checkAuthentication]);

  const logout = useCallback(async () => {
    await axios.post("/auth/logout");

    // Clear axios header
    delete axios.defaults.headers.common["Authorization"];

    setAuthentication({
      id: 0,
      name: "",
      email: "",
      citizenshipNumber: "",
      voterId: "",
      isAdmin: false,
      isVerified: false,
      authenticated: false,
      accessToken: "",
      loading: false,
    });

    navigate("/");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        id: authentication.id,
        name: authentication.name,
        email: authentication.email,
        citizenshipNumber: authentication.citizenshipNumber,
        voterId: authentication.voterId,
        isAdmin: authentication.isAdmin,
        isVerified: authentication.isVerified,
        authenticated: authentication.authenticated,
        accessToken: authentication.accessToken,
        loading: authentication.loading,
        authenticate,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
