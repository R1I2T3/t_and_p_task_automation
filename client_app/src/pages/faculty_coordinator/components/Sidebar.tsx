import { Link } from "react-router"; // Import Link for routing
import "./Sidebar.css";
import { authAtom } from "@/authAtom";
import { useAtomValue } from "jotai";
import { logout, redirectToProfile } from "@/utils";
const Sidebar = () => {
  const auth = useAtomValue(authAtom);
  return (
    <aside className={`sidebar `}>
      <div className="logo-container">
        <img src="/img/logo.png" alt="TCET Logo" className="logo" />

        <h1 className="title" style={{ color: "#153f74" }}>
          TCET - TNP
        </h1>
      </div>
      <ul className="menu">
        <Link to="/faculty_coordinator" className="menu-item">
          <img
            src="/img/Training_Programme_Statistics.png"
            alt="Student Data"
            className="menu-icon"
          />
          <p>Session Attendance</p>
        </Link>
        {auth?.department && (
          <Link to={"/department_coordinator"} className="menu-item">
            <img
              src="/img/Training_Programme_Statistics.png"
              alt="Student Data"
              className="menu-icon"
            />
            Department
          </Link>
        )}
        {auth?.program && (
          <Link to={"/program_coordinator"} className="menu-item">
            <img
              src="/img/Training_Programme_Statistics.png"
              alt="Student Data"
              className="menu-icon"
            />
            Program
          </Link>
        )}
      </ul>
      <div className="footer"></div>
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
