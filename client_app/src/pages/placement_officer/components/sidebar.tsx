import { NavLink } from "react-router"; // Import Link for routing
import "./sidebar.css";
import {
  Building2,
  NotebookPen,
  ClipboardMinus,
  Send,
  Verified,
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
        <NavLink to="comparative_Placement_Statistics" className="menu-item">
          <img src={Stats} alt="Placement Statistics" className="menu-icon" />
          <p>comparative Placement Statistics</p>
        </NavLink>
        <NavLink to="create_notice" className="menu-item gap-3">
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
        <NavLink to="attendance" className="menu-item gap-3">
          <Verified />
          <p>Attendance</p>
        </NavLink>
        <NavLink to="/notifications/create" className="menu-item gap-3">
          <Send />
          <p>Notification</p>
        </NavLink>
        <NavLink to="/category-rule-form" className="menu-item">
          <img src={Stats} alt="Placement Statistics" className="menu-icon" />
          <p>Category Rule Form</p>
        </NavLink>
      <NavLink to="/category-rules/list" className="menu-item">
        <img src={Stats} alt="List Category Rules" className="menu-icon" />
        <p>List Category Rules</p>
      </NavLink>
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
