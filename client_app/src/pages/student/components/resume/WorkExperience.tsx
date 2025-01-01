import { Box, Typography, Stack } from "@mui/material";
import { Calendar1Icon } from "lucide-react";
import { WorkExperience } from "../../types";
import { SectionTitle } from "./SectionTitle";
import { TimelineItem } from "./TImelineItem";

interface WorkExperienceSectionProps {
  workExperience: WorkExperience[];
}

export const WorkExperienceSection = ({
  workExperience,
}: WorkExperienceSectionProps) => (
  <Box component="section" sx={{ width: "95%", backgroundColor: "white" }}>
    <SectionTitle>Work Experience</SectionTitle>
    <Stack spacing={3}>
      {workExperience.map((work) => (
        <TimelineItem key={work.id}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {work.position}
              </Typography>
              <Typography color="text.secondary">{work.company}</Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="text.secondary"
            >
              <Calendar1Icon fontSize="small" />
              <Typography variant="body2">
                {work.start_date} - {work.end_date}
              </Typography>
            </Stack>
          </Stack>
          <Typography color="text.secondary" mt={2}>
            {work.description}
          </Typography>
        </TimelineItem>
      ))}
    </Stack>
  </Box>
);
