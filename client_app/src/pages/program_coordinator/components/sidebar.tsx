import React from "react";
import { Link } from "react-router";
import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { MessageCircle } from "lucide-react";
import { logout, redirectToProfile } from "@/utils";
const Sidebar = () => {
  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo src="/img/logo.png" alt="TCET Logo" />
        <Typography variant="h5" className="title">
          TCET - TNP
        </Typography>
      </LogoContainer>

      <Menu>
        <MenuItem
          to="/program_coordinator/"
          label="Student Data"
          icon="/img/student.png"
        />
        <MenuItem
          to="/program_coordinator/attendance-and-marks"
          label="Attendance and Marks"
          icon="/img/Placement_statics.png"
        />
        <MenuItem
          to="/program_coordinator/session-creation"
          label="Session Creation"
          icon="/img/image.png"
        />
        <MenuItem
          to="/program_coordinator/update-attendance"
          label="Grievance"
          icon="/img/Fill-Out_smc.png"
        />
        <MenuItem
          to="/program_coordinator/upload-file"
          label="Upload Report"
          icon="/img/Training_Programme_Statistics.png"
        />
        <MenuItem
          to="/notifications/create"
          label="Create Notification"
          icon={<MessageCircle size={24} />}
        />
      </Menu>

      <BottomMenu>
        <IconButton component={Link} to="/profile" onClick={redirectToProfile}>
          <ProfileIcon src="/img/user_profile.png" alt="Profile" />
        </IconButton>
        <IconButton component={Link} to="/logout" onClick={logout}>
          <LogoutIcon src="/img/logout.png" alt="Logout" />
        </IconButton>
      </BottomMenu>
    </SidebarContainer>
  );
};

// Styled components using Material-UI's `styled` API
const SidebarContainer = styled(Box)(() => ({
  width: "20%",
  backgroundColor: "white",
  color: "#153f74",
  padding: "20px",
  borderRadius: "24px",
  margin: "20px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "fixed",
  top: 0,
  left: 0,
  height: "96vh",
  border: "#000000",
}));

const LogoContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Logo = styled("img")({
  height: "80px",
  marginBottom: "10px",
});

const Menu = styled(Box)({
  listStyle: "none",
  padding: 0,
  margin: 0,
});

const MenuItemLink = styled(Link)(() => ({
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  marginBottom: "40px",
  color: "#153f74",
  fontSize: "1rem",
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#1b4d96",
  },
}));

const MenuItem = ({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string | React.ReactNode;
}) => {
  return (
    <MenuItemLink to={to}>
      {typeof icon === "string" ? (
        <img
          src={icon}
          alt={label}
          className="menu-icon"
          style={{ height: "1.5rem", marginRight: "10px" }}
        />
      ) : (
        icon
      )}
      <Typography>{label}</Typography>
    </MenuItemLink>
  );
};

const BottomMenu = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});

const ProfileIcon = styled("img")({
  width: "50px",
  borderRadius: "12px",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
  },
});

const LogoutIcon = styled("img")({
  width: "50px",
  borderRadius: "12px",
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
  },
});

export default Sidebar;
