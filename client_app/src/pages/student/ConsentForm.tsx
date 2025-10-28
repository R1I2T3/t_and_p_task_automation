import { useState } from "react";
import axios from "axios";
import { getCookie } from "../../utils";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router";

const ConsentForm = () => {
  const [consentOption, setConsentOption] = useState("placement");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrfToken = getCookie("csrftoken");

  const consentOptions = ["placement", "Higher studies", "Entrepreneurship"];
  const { id } = useParams();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.patch(
        `/api/student/consent/${id}`,
        { consent: consentOption },
        {
          headers: {
            "X-CSRFToken": csrfToken || "",
          },
          withCredentials: true,
        }
      );
      console.log("Consent Data:", response.data);
      alert("Consent submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting consent:", error);
      const errorMessage = error?.response?.data?.error || "Failed to submit consent!";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        borderRadius: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        Consent Form
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal">
          <InputLabel id="consent-label">Select your consent</InputLabel>
          <Select
            labelId="consent-label"
            id="consent"
            value={consentOption}
            label="Select your consent"
            onChange={(e) => setConsentOption(e.target.value)}
          >
            {consentOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ mt: 3 }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ConsentForm;