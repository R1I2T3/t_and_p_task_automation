import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import { getCookie } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
const CreateNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState<string[]>(["All"]);
  const [branch, setBranch] = useState<string[]>(["All"]);
  const year_options = ["All", "FE", "SE", "TE", "BE"];
  const branch_options = [
    "All",
    "Computer",
    "IT",
    "EXTC",
    "Mechanical",
    "Civil",
    "AIML",
    "AI&DS",
    "MME",
  ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    formData.append("academic_year", year.join(","));
    formData.append("department", branch.join(","));
    if (files) formData.append("files", files);

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
      // Handle successful notification creation
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("Error creating notification");
    }
  };

  const handleYearChange = (e: SelectChangeEvent<typeof year_options>) => {
    const {
      target: { value },
    } = e;
    setYear(typeof value === "string" ? value.split(",") : value);
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
        <Typography variant="h4">Create Notification</Typography>
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
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                setFiles(e.target.files[0]);
              }
            }}
            style={{ margin: "20px 0" }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            className="w-full  text-white"
          >
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateNotification;
