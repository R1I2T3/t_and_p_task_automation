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
          padding: "10px 20px",
          borderRadius: "8px",
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
          sx={{ maxWidth: "600px", width: "100%" }}
        >
          {filteredNotifications.map((notification) => (
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
