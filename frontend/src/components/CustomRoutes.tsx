import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { AuthContext } from "../contexts/Auth";
import UserPollsPage from "../pages/User/Polls";
import HomePage from "../pages/Admin/Home";
import ProfilePage from "../pages/User/Profile";
import Default from "../layouts/Default";
import AdminUsersPage from "../pages/Admin/Users";
import AdminVerifyPage from "../pages/Admin/Verify";

export default () => {
  const authContext = useContext(AuthContext);

  const getRoutes = (): JSX.Element => {
    if (authContext.loading) return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f172a',
        color: '#6366f1',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Initializing Voting System...
      </div>
    );

    if (authContext.authenticated) {
      // if the user is authenticated then

      const adminMenu = [
        { name: "Election Dashboard", link: "/" },
        { name: "Voter Verification", link: "/users" },
        { name: "My Profile", link: "/profile" },
      ];

      const userMenu = [
        { name: "Active Ballots", link: "/" },
        { name: "Voter Profile", link: "/profile" },
      ];

      if (authContext.isAdmin) {
        // if the user is admin
        return (
          <Default menu={adminMenu}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/verify/:name/:id" element={<AdminVerifyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Default>
        );
      } else {
        //  if the user in not admin
        return (
          <Default menu={userMenu}>
            <Routes>
              <Route path="/" element={<UserPollsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Default>
        );
      }
    } else {
      // if the user is not authenticated
      return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/voter" element={<Login type="voter" />} />
          <Route path="/login/admin" element={<Login type="admin" />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      );
    }
  };

  return getRoutes();
};
