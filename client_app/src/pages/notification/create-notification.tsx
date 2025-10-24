import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axios from "axios";
import { getCookie } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import toast from "react-hot-toast";

const CreateNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState<string[]>(["FE"]);
  const [branch, setBranch] = useState<string[]>(["IT"]);
  const [type_notification, setType_notification] = useState<string>("General");

  // Added missing state for optional form link and expiration
  const [generateLink, setGenerateLink] = useState<boolean>(false);
  const [formType, setFormType] = useState<string>("consent");
  const formTypeOptions = ["consent", "pli", "survey"];
  const [expiration, setExpiration] = useState<string>("");

  const year_options = ["FE", "SE", "TE", "BE"];
  const branch_options = [
    "Computer",
    "IT",
    "EXTC",
    "Mechanical",
    "Civil",
    "AIML",
    "AI&DS",
    "MME",
  ];
  const type_notification_options = [
    "General",
    "Training",
    "Placement",
    "Internship",
    "Resource",
  ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("academic_year", year.join(","));
    formData.append("department", branch.join(","));
    formData.append("type_notification", type_notification);
    if (files) formData.append("files", files);
    if (expiration) formData.append("expires_at", new Date(expiration).toISOString());

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await axios.post("/api/notifications/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true,
      });
      console.log("Notification created:", response.data);
      toast.success("Notification created successfully");
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("Error creating notification");
    }
  };

  const handleYearChange = (e: SelectChangeEvent<typeof year_options>) => {
    const { value } = e.target;
    setYear(typeof value === "string" ? value.split(",") : value);
  };
  const handleTypeChange = (
    event: SelectChangeEvent<typeof type_notification_options>
  ) => {
    setType_notification(event.target.value as string);
  };
  const handleDepartmentChange = (
    e: SelectChangeEvent<typeof year_options>
  ) => {
    const {
      target: { value },
    } = e;
    setBranch(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Card className="w-full max-w-md mx-auto flex justify-center items-center mt-[20dvh]">
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Create Notification
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            margin="normal"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={generateLink}
                onChange={(e) => setGenerateLink(e.target.checked)}
              />
            }
            label="Include a response form link (Consent / PLI / Survey)"
          />

          {generateLink && (
            <Select
              className="w-full mb-2"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              fullWidth
            >
              {formTypeOptions.map((type, index) => (
                <MenuItem key={index} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          )}

          <TextField
            label="Expiry Date & Time"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Select
            className="w-full mb-2"
            multiple
            value={year}
            renderValue={(selected) => selected.join(", ")}
            onChange={handleYearChange}
          >
            {year_options.map((year, index) => (
              <MenuItem key={index} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>

          <Select
            className="w-full mb-2"
            multiple
            value={branch}
            renderValue={(selected) => selected.join(", ")}
            onChange={handleDepartmentChange}
          >
            {branch_options.map((branch, index) => (
              <MenuItem key={index} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </Select>
          <Select
            className="w-full mb-2"
            value={type_notification}
            renderValue={(selected) => (typeof selected === "string" ? selected : String(selected))}
            onChange={handleTypeChange}
          >
            {type_notification_options.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <label htmlFor="file-input" className="file-label">
            <Button variant="outlined" component="span">
              {files ? "Change file" : "Upload file"}
            </Button>
          </label>
          <input
            id="file-input"
            type="file"
            title="Choose file to upload"
            placeholder="Choose a file"
            aria-label="File upload"
            onChange={(e) => {
              if (e.target.files) setFiles(e.target.files[0]);
            }}
            className="file-input"
          />

          {error && <Typography color="error">{error}</Typography>}

          <Button
            type="submit"
            variant="contained"
            className="w-full text-white"
          >
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateNotification;
