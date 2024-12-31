import React from "react";
import { NavLink } from "react-router"; // Import Link for routing
import "../../placement_officer/components/sidebar.css";
import { NotebookPen, Send } from "lucide-react";
import { logout, redirectToProfile } from "@/utils";
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src="/img/logo.png" alt="TCET Logo" className="logo" />
        <h1 className="title">TCET - TNP</h1>
      </div>
      <ul className="menu">
        <NavLink to="" className="menu-item">
          <img
            src="/img/Placement_statics.png"
            alt="Placement Statistics"
            className="menu-icon"
          />
          <p>Students</p>
        </NavLink>
        <NavLink to="attendance" className="menu-item">
          <img
            src="/img/Placement_statics.png"
            alt="Placement Statistics"
            className="menu-icon"
          />
          <p>Attendance and Marks</p>
        </NavLink>
        <NavLink to="stats" className="menu-item gap-3">
          <NotebookPen />
          <p>Stats</p>
        </NavLink>
        <NavLink to="/notifications/create" className="menu-item gap-3">
          <Send />
          <p>Notification</p>
        </NavLink>
      </ul>
      <div className="bottom-menu">
        <button
          className="profile-icon bg-transparent hover:bg-transparent"
          onClick={redirectToProfile}
        >
          <img src="/img/user_profile.png" alt="Profile" />
        </button>
        <button
          className="logout-icon bg-transparent hover:bg-transparent"
          onClick={logout}
        >
          <img src="/img/logout.png" alt="Logout" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
