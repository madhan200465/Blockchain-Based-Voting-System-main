import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/Back";
import Navbar from "../components/Navbar";

type MenuLink = {
  name: string;
  link: string;
};

type DefaultProps = {
  menu: MenuLink[];
  children: JSX.Element;
};

const Default = (props: DefaultProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const hideIfOutside = (event: MouseEvent) => {
      const sidebarElement = document.getElementById("default-sidebar");
      const toggleButton = document.getElementById("outside-ham");

      if (!sidebarElement?.contains(event.target as Node) && !toggleButton?.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("click", hideIfOutside);

    return () => {
      window.removeEventListener("click", hideIfOutside);
    };
  }, []);

  const toggleHandler = () => {
    setSidebarOpen((current) => !current);
  };

  return (
    <div className="default-container">
      <div id="default-sidebar" className={`default-sidebar ${sidebarOpen ? "display" : "hide"}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <div className="brand-name">SecureVote</div>
            <div className="brand-subtitle">Election workspace</div>
          </div>
        </div>

        <div className="sidebar-links">
          {props.menu.map(({ name, link }, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                toggleHandler();
                navigate(link);
              }}
              className={`default-sidebar-link ${pathname === link ? "active" : ""}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <button id="outside-ham" onClick={toggleHandler} className="hamburger" type="button" aria-label="Open navigation">
        <i className="bi bi-list"></i>
      </button>

      <button
        className={`default-backdrop ${sidebarOpen ? "show" : ""}`}
        type="button"
        onClick={toggleHandler}
        aria-label="Close navigation"
      />

      <div className="default-content-shell">
        <Navbar />
        <div className="default-content">
          <div className="default-frame">
            {pathname !== "/profile" ? <BackButton call={() => navigate(-1)} /> : null}
            <div className="default-panel">{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default;
