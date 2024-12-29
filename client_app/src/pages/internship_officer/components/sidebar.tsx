import React from "react";
import { NavLink } from "react-router"; // Import Link for routing
import "../../placement_officer/components/sidebar.css";
import {
  Building2,
  NotebookPen,
  ClipboardMinus,
  Send,
  Verified,
} from "lucide-react";
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
          <p>Internship Statistics</p>
        </NavLink>
        <NavLink to="notice" className="menu-item gap-3">
          <NotebookPen />
          <p>Notice Creation</p>
        </NavLink>
        <NavLink to="company_register" className="menu-item gap-3">
          <Building2 />
          <p>Company Registration Form</p>
        </NavLink>
        <NavLink to="report" className="menu-item gap-3">
          <ClipboardMinus />
          <p>One Page report</p>
        </NavLink>
        <NavLink to="verify" className="menu-item gap-3">
          <Verified />
          <p>Verify</p>
        </NavLink>
        <NavLink to="/notifications/create" className="menu-item gap-3">
          <Send />
          <p>Notification</p>
        </NavLink>
      </ul>
      <div className="bottom-menu">
        <NavLink to="/profile" className="profile-icon">
          <img src="/img/user_profile.png" alt="Profile" />
        </NavLink>
        <NavLink to="/logout" className="logout-icon">
          <img src="/img/logout.png" alt="Logout" />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;