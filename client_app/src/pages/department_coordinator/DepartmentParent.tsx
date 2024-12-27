import React from "react";
import { Outlet } from "react-router";
const DepartmentParent = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-screen">
      <Outlet />
    </div>
  );
};

export default DepartmentParent;
