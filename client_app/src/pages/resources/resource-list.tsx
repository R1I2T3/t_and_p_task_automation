import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from "@mui/material";
import axios from "axios";

interface ResourceProps {
  id: number;
  title: string;
  description: string;
  creator_name: string;
  created_at: string;
}

const ResourceList = () => {
  const [resources, setResources] = useState<ResourceProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get("/api/resources/", {
          withCredentials: true,
        });
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResources();
  }, []);

  const handleViewResource = (id: number) => {
    navigate(`${id}`);
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
        Resources
      </Typography>
      {resources.length === 0 ? (
        <Typography variant="body1">No resources available.</Typography>
      ) : (
        <Grid container spacing={3} direction="column" sx={{ maxWidth: "600px" }}>
          {resources.map((resource) => (
            <Grid item key={resource.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, padding: 2 }}>
                <CardActionArea onClick={() => handleViewResource(resource.id)}>
                  <CardContent sx={{ textAlign: "left" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {resource.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ marginBottom: 1 }}
                    >
                      {resource.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="orange"
                      sx={{ display: "block" }}
                    >
                      Created by: {resource.creator_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created at:{" "}
                      {new Date(resource.created_at).toLocaleString()}
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

export default ResourceList;
