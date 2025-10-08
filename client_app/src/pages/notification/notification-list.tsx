import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";

interface NotificationProps {
  id: number;
  title: string;
  message: string;
  creator_name: string;
  created_at: string;
  type_notification: string;
}

const type_notification_options = [
  "All",
  "General",
  "Training",
  "placement",
  "Internship",
  "Resource",
];

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [selectedType, setSelectedType] = useState<string>("All");
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

  const handleViewNotification = (id: number) => {
    navigate(`/notifications/${id}`);
  };

  // filter based on type
  const filteredNotifications =
    selectedType === "All"
      ? notifications
      : notifications.filter((n) => n.type_notification === selectedType);

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

      {/* Filter dropdown */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="type-select-label">Filter by Type</InputLabel>
        <Select
          labelId="type-select-label"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {type_notification_options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredNotifications.length === 0 ? (
        <Typography variant="body1">No notifications available.</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          direction="column"
          sx={{ maxWidth: "600px" }}
        >
          {filteredNotifications.map((notification) => (
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
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 1, fontWeight: "bold" }}
                    >
                      Type: {notification.type_notification}
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
