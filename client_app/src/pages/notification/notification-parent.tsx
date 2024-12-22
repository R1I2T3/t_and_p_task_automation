import React from "react";
import { Outlet } from "react-router";

const NotificationParent = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default NotificationParent;
