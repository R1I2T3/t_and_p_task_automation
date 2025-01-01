import React from "react";
import Sidebar from "./components/SideBar";
import { Typography } from "@mui/material";
import "../placement_officer/placement.css";
import { Outlet } from "react-router";
const StaffLayout = () => {
  return (
    <div className="ribbon">
      <div className="app">
        <Sidebar />
        <main className="main-content1">
          <Typography variant="h3" gutterBottom>
            <u>Staff</u>
          </Typography>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
