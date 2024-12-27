import React from "react";
import { useLocation, Link } from "react-router";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();

  const handleLogout = () => {
    // Implement logout logic here
    // e.g., clear local storage, call logout API, etc.
  };

  const isActivePath = (path: string) => {
    return pathname === path ? "text-orange-600" : "";
  };

  return (
    <div className="h-full w-full flex">
      <div className="z-[-1] absolute bg-[#d48525] h-[25%] w-full top-0"></div>
      <aside className="flex flex-col w-1/5 sticky top-4 h-screen bg-white text-[#153f74] p-5 rounded-3xl ml-2 my-5 mr-0 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center mb-5">
          <img
            src="/img/logo.png"
            alt="TCET Logo"
            width={80}
            height={80}
            className="mr-2.5"
          />
          <h1 className="text-xl font-bold">TCET - TNP</h1>
        </div>

        <ul className="list-none p-0 m-0">
          <li>
            <Link
              to="/department_coordinator"
              className={`my-5 text-lg flex items-center ${isActivePath(
                "/department_coordinator"
              )}`}
            >
              <img
                src="/img/Training_Programme_Statistics.png"
                alt="Student Data"
                width={24}
                height={24}
                className="lg:mr-2.5 mx-auto lg:m-0"
              />
              <p className="hidden lg:block">Student Data</p>
            </Link>
          </li>

          <li>
            <Link
              to="/department_coordinator/attendance"
              className={`my-5 text-lg flex items-center ${isActivePath(
                "/department_coordinator/attendance"
              )}`}
            >
              <img
                src="/img/student.png"
                alt="Attendance"
                width={24}
                height={24}
                className="lg:mr-2.5 mx-auto lg:m-0"
              />
              <p className="hidden lg:block">Attendance and marks</p>
            </Link>
          </li>

          <li>
            <Link
              to="/department_coordinator/stats"
              className={`my-5 text-lg flex items-center m-auto ${isActivePath(
                "/department_coordinator/stats"
              )}`}
            >
              <img
                src="/img/Training_Programme_Statistics.png"
                alt="Statistics"
                width={24}
                height={24}
                className="lg:mr-2.5 mx-auto lg:m-0"
              />
              <p className="hidden lg:block">Statistics</p>
            </Link>
          </li>
        </ul>

        <div className="flex-grow" />

        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <Link to="/profile">
            <img
              src="/img/user_profile.png"
              alt="User Profile"
              width={50}
              height={50}
              className="rounded-lg"
            />
          </Link>
          <button onClick={handleLogout}>
            <img
              src="/img/logout.png"
              alt="Logout"
              width={50}
              height={50}
              className="rounded-lg"
            />
          </button>
        </div>
      </aside>

      <div className="flex flex-col text-[#fbf4eb] w-4/5 p-5">
        <h1
          className="m-0 font-semibold text-[38px]"
          style={{ fontFamily: "poppins" }}
        >
          Department Coordinator
        </h1>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
