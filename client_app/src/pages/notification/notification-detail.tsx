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
    <Box display="flex" justifyContent="center" alignItems="center" mt={10}>
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          boxShadow: 4,
          opacity: expired ? 0.75 : 1,
        }}
      >
        <CardContent>
          {notification.files && <Box mb={2}>{renderFile(notification.files)}</Box>}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" fontWeight="bold">
              {notification.title}
            </Typography>
            {expired && (
              <Chip label="Expired" color="error" variant="outlined" size="small" />
            )}
          </Box>

          <Typography variant="body1" gutterBottom>
            {notification.message}
          </Typography>

          {notification.link && (
              <Box mt={2}>
                <Typography variant="body2" fontWeight="bold">
                  Link:
                </Typography>
                <a
                  href={notification.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1976d2", wordBreak: "break-word" }}
                >
                  {notification.link}
                </a>
              </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            Created at: {formatDate(notification.created_at)}
          </Typography>

          {notification.expires_at && (
            <Typography variant="body2" color="text.secondary">
              Expiry date: {formatDate(notification.expires_at)}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleBack}
            sx={{ mt: 3 }}
          >
            Back to Notifications
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationDetail;