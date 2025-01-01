import { Box } from "@mui/material";
import { PropsWithChildren } from "react";

export const TimelineItem = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      position: "relative",
      pl: 3,
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        bgcolor: "primary.main",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        left: -4,
        top: 0,
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: "primary.main",
      },
    }}
  >
    {children}
  </Box>
);
