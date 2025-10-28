import { Box, Typography } from "@mui/material";
import Sidebar from "./components/sidebar";
import { useAtomValue } from "jotai";
import { authAtom } from "@/authAtom";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgramCoordinatorLayout = () => {
  const authUser = useAtomValue(authAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (!authUser || authUser.role !== "faculty" || !authUser.program) {
      navigate("/");
    }
  }, []);
  return (
    <div className="tailwind-free-zone">
      <Box sx={{ display: "flex", flexDirection: "row", width: "200vh" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "orange",
            padding: "2rem",
            overflowY: "auto",
            marginLeft: "450px",
            transition: "margin-left 0.3s",
            marginTop: "20px",
            borderRadius: "20px",
            height: "auto",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#153f74",
              color: "#fff",
              padding: "1.5rem 3rem",
              borderRadius: "15px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              marginBottom: "2rem",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                letterSpacing: "1px",
                textAlign: "center",
                textTransform: "uppercase",
                fontFamily: "'Roboto', sans-serif",
                lineHeight: 1.3,
              }}
            >
              Program Coordinator
            </Typography>
          </Box>
          <Outlet />
        </Box>
      </Box>
    </div>
  );
};

export default ProgramCoordinatorLayout;
