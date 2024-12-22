import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Button,
} from "@mui/material";
import axios from "axios";
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications/", {
          withCredentials: true,
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);
  const handleViewNotification = (id) => {
    navigate(`/notifications/${id}`);
  };
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
          padding: "10px",
          borderRadius: "5px",
          color: "white",
        }}
      >
        Notifications
      </Typography>
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
