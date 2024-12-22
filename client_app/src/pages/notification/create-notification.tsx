import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import axios from "axios";

const CreateNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleRecipientChange = (userId: string) => {
    setRecipients((prevRecipients) =>
      prevRecipients.includes(userId)
        ? prevRecipients.filter((id) => id !== userId)
        : [...prevRecipients, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);
    if (files) formData.append("files", files);
    recipients.forEach((recipient) => formData.append("recipients", recipient));

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/notifications/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Notification created:", response.data);
      // Handle successful notification creation
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("Error creating notification");
    }
  };

  return (
    <div>
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
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files) {
              setFiles(e.target.files[0]);
            }
          }}
          style={{ margin: "20px 0" }}
        />
        <FormGroup>
          {users.map((user) => (
            <FormControlLabel
              key={user.id}
              control={
                <Checkbox
                  checked={recipients.includes(user.id)}
                  onChange={() => handleRecipientChange(user.id)}
                />
              }
              label={user.username}
            />
          ))}
        </FormGroup>
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">
          Create
        </Button>
      </form>
    </div>
  );
};

export default CreateNotification;
