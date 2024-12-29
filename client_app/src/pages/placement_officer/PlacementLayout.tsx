import React from "react";
import Sidebar from "./components/sidebar";
import { Typography } from "@mui/material";
import "./placement.css";
import { Outlet } from "react-router";
const PlacementLayout = () => {
  return (
    <div className="ribbon">
      <div className="app">
        <Sidebar />
        <main className="main-content1">
          <Typography variant="h3" gutterBottom>
            <u>Placement Coordinator</u>
          </Typography>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PlacementLayout;
