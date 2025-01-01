/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { logout, redirectToProfile } from "@/utils";
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src="/img/logo.png" alt="TCET Logo" className="logo" />
        <h1 className="title">TCET - TNP</h1>
      </div>
      <ul className="menu">
        <NavLink to="" className="menu-item gap-3">
          <NotebookPen />
          <p>Notice Creation</p>
        </NavLink>
        <NavLink to="placement/register" className="menu-item gap-3">
          <Building2 />
          <p>Placement Company Form</p>
        </NavLink>
        <NavLink to="internship/register" className="menu-item gap-3">
          <Building2 />
          <p>InternShip Company Form</p>
        </NavLink>
        <NavLink to="placement/verify" className="menu-item gap-3">
          <Verified />
          <p>Verify Placement</p>
        </NavLink>
        <NavLink to="internship/verify" className="menu-item gap-3">
          <Verified />
          <p>Verify Internship</p>
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
