import { Typography } from "@mui/material";
import { PropsWithChildren } from "react";

export const SectionTitle = ({ children }: PropsWithChildren) => (
  <Typography
    variant="h5"
    fontWeight="bold"
    sx={{
      mb: 3,
      pb: 1,
      borderBottom: 1,
      borderColor: "divider",
    }}
  >
    {children}
  </Typography>
);
