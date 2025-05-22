import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import axios from "axios";

interface NotificationProps {
  id: number;
  title: string;
  message: string;
  creator_name: string;
  created_at: string;
  expires_at?: string;
}

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get("/api/notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleViewNotification = (id: number) => {
    navigate(`/notifications/${id}`);
  };

  const isExpired = (expiresAt?: string) =>
    expiresAt && new Date(expiresAt) < new Date();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB"); // DD/MM/YYYY

  return (
    <Box
      sx={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        marginTop: "80px",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          backgroundColor: "orange",
          padding: "10px 20px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 3 }}>
          No notifications available.
        </Typography>
      ) : (
        <Grid
          container
          spacing={3}
          direction="column"
          sx={{ maxWidth: "600px", width: "100%" }}
        >
          {notifications.map((notification) => (
            <Grid item key={notification.id}>
              <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                <CardActionArea
                  onClick={() => handleViewNotification(notification.id)}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      {isExpired(notification.expires_at) && (
                        <Chip label="Expired" color="error" size="small" />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {notification.message}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      Created by:{" "}
                      <Box component="span" fontWeight="medium" color="orange">
                        {notification.creator_name}
                      </Box>
                    </Typography>

                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      Created at: {formatDate(notification.created_at)}
                    </Typography>

                    {notification.expires_at && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Expires on: {formatDate(notification.expires_at)}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NotificationList;
