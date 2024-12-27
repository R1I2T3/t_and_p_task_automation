import React from "react";
import { Link } from "react-router"; // Import Link for routing
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src="/img/logo.png" alt="TCET Logo" className="logo" />
        <h1 className="title" style={{ color: "#153f74" }}>
          TCET - TNP
        </h1>
      </div>
      <ul className="menu">
        <Link to="/" className="menu-item">
          <img
            src="/img/Training_Programme_Statistics.png"
            alt="Student Data"
            className="menu-icon"
          />
          <p>Session Attendance</p>
        </Link>
      </ul>
      <div className="footer"></div>
      <div className="bottom-menu">
        <Link to="/profile" className="profile-icon">
          <img src="/img/user_profile.png" alt="Profile" />
        </Link>
        <Link to="/logout" className="logout-icon">
          <img src="/img/logout.png" alt="Logout" />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
