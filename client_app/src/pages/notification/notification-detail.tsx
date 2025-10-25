import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Chip,
} from "@mui/material";

const NotificationDetail = () => {
  const { id } = useParams();
  interface Notification {
    title: string;
    message: string;
    created_at: string;
    expires_at?: string;
    files?: string;
    link?: string; // <-- Add this
  }  

  const [notification, setNotification] = useState<Notification | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(`/api/notifications/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Notification data:", response.data)
        setNotification(response.data);
      } catch (error) {
        console.error("Error fetching notification:", error);
      }
    };
    fetchNotification();
  }, [id]);

  const handleBack = () => {
    navigate("/notifications");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
  };

  const isExpired = (expiresAt?: string) =>
    expiresAt && new Date(expiresAt) < new Date();

  const renderFile = (fileUrl: string) => {
    // @ts-expect-error Property 'split' does not exist on type 'string'.
    const fileExtension = fileUrl.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return (
        <img
          src={`${fileUrl}`}
          alt="Notification"
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />
      );
    } else if (fileExtension === "pdf") {
      return (
        <a href={`${fileUrl}`} target="_blank" rel="noopener noreferrer">
          View PDF
        </a>
      );
    } else {
      return <p>Unsupported file type</p>;
    }
  };

  if (!notification) {
    return (
      <Typography sx={{ mt: 10, textAlign: "center" }}>Loading...</Typography>
    );
  }

  const expired = isExpired(notification.expires_at);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "90px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        {notification.files && renderFile(notification.files)}
        <h2>{notification.title}</h2>
        <pre>{notification.message}</pre>
        <p>
          <small>
            Created at: {new Date(notification.created_at).toLocaleString()}
          </small>
        </p>
      </div>
      <button
        onClick={handleBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Back to Notifications
      </button>
    </div>
  );
};

export default NotificationDetail;