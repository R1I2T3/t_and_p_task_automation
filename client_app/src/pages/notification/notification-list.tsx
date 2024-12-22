import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Button,
} from "@mui/material";

interface Notification {
  id: number;
  title: string;
  message: string;
  creator_name: string;
  created_at: string;
}

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/notifications/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
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

  const handleCreateNotification = () => {
    navigate("/create-notification");
  };

  return (
    <Box
      sx={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          backgroundColor: "orange",
          padding: "10px",
          borderRadius: "5px",
          color: "white",
        }}
      >
        Notifications
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNotification}
        sx={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Create
      </Button>
      {notifications.length === 0 ? (
        <Typography variant="body1">No notifications available.</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          direction="column"
          sx={{ maxWidth: "600px", margin: "0 auto" }}
        >
          {notifications.map((notification) => (
            <Grid item key={notification.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                <CardActionArea
                  onClick={() => handleViewNotification(notification.id)}
                >
                  <CardContent sx={{ textAlign: "left" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ marginBottom: 1 }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="orange"
                      sx={{ display: "block" }}
                    >
                      Created by: {notification.creator_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created at:{" "}
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
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
