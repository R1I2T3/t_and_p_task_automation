import React from "react";
import Sidebar from "./components/sidebar";
import { Typography } from "@mui/material";
import "../placement_officer/placement.css";
import { Outlet } from "react-router";
const InternshipLayout = () => {
  return (
    <div className="ribbon">
      <div className="app">
        <Sidebar />
        <main className="main-content1">
          <Typography variant="h3" gutterBottom>
            <u>Internship Coordinator</u>
          </Typography>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InternshipLayout;
