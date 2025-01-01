import { Box, Typography, Stack } from "@mui/material";
import { Project } from "../../types";
import { SectionTitle } from "./SectionTitle";
import { TimelineItem } from "./TImelineItem";

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection = ({ projects }: ProjectsSectionProps) => (
  <Box component="section" sx={{ width: "95%", backgroundColor: "white" }}>
    <SectionTitle>Projects</SectionTitle>
    <Stack spacing={3}>
      {projects.map((project) => (
        <TimelineItem key={project.id}>
          <Typography variant="h6" fontWeight="bold">
            {project.title}
          </Typography>
          <Typography color="text.secondary" mt={2}>
            {project.description}
          </Typography>
        </TimelineItem>
      ))}
    </Stack>
  </Box>
);
