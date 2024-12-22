import React from "react";
import { Box, Button } from "@mui/material";

const Submit = ({ isSubmitted }) => {
  return (
    <Box mt={4} textAlign="center">
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitted}
        sx={{ px: 4, py: 1 }}
      >
        {isSubmitted ? "Submitted" : "Submit"}
      </Button>
    </Box>
  );
};

export default Submit;
