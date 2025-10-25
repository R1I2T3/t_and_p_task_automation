import { NavLink } from "react-router";
import "./sidebar.css";
import {
  Send,
} from "lucide-react";
import { logout, redirectToProfile } from "@/utils";
import Logo from "@/assets/img/logo.png";
import Stats from "@/assets/img/Placement_statics.png";
import ProfileIcon from "@/assets/img/user_profile.png";
import LogoutIcon from "@/assets/img/logout.png";
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={Logo} alt="TCET Logo" className="logo" />
        <h1 className="title">TCET - TNP</h1>
      </div>
      <ul className="menu">
        <NavLink to="" className="menu-item">
          <img src={Stats} alt="Placement Statistics" className="menu-icon" />
          <p>Placement Statistics</p>
        </NavLink>
        <NavLink to="placement-consolidated-report" className="menu-item">
          <p>Consolidated Report</p>
        </NavLink>
        <NavLink to="/notifications/create" className="menu-item gap-3">
          <Send />
          <p>Notification</p>
        </NavLink>
        {/* <NavLink to="/category-rule-form" className="menu-item">
          <img src={Stats} alt="Placement Statistics" className="menu-icon" />
          <p>Category Rule Form</p>
        </NavLink>
      <NavLink to="/category-rules/list" className="menu-item">
        <img src={Stats} alt="List Category Rules" className="menu-icon" />
        <p>List Category Rules</p>
      </NavLink> */}
      </ul>
      <div className="bottom-menu">
        <button
          className="profile-icon bg-transparent hover:bg-transparent"
          onClick={redirectToProfile}
        >
          <img src={ProfileIcon} alt="Profile" />
        </button>
        <button
          className="logout-icon bg-transparent hover:bg-transparent"
          onClick={logout}
        >
          <img src={LogoutIcon} alt="Logout" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
