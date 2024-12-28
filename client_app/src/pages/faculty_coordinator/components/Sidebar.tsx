import React from "react";
import { Link } from "react-router"; // Import Link for routing
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo-container">
        <img src="/img/logo.png" alt="TCET Logo" className="logo" />
        {!isCollapsed && (
          <h1 className="title" style={{ color: "#153f74" }}>
            TCET - TNP
          </h1>
        )}
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>
      <ul className="menu">
        <Link to="/faculty_coordinator" className="menu-item">
          <img
            src="/img/Training_Programme_Statistics.png"
            alt="Student Data"
            className="menu-icon"
          />
          {!isCollapsed && <p>Session Attendance</p>}
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
