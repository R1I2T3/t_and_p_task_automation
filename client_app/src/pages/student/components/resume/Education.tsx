import { Box, Typography, Stack } from "@mui/material";
import { Calendar1Icon } from "lucide-react";
import { Education } from "../../types";
import { SectionTitle } from "./SectionTitle";
import { TimelineItem } from "./TImelineItem";

interface EducationSectionProps {
  education: Education[];
}

export const EducationSection = ({ education }: EducationSectionProps) => (
  <Box component="section" sx={{ width: "95%", backgroundColor: "white" }}>
    <SectionTitle>Education</SectionTitle>
    <Stack spacing={3}>
      {education.map((edu) => (
        <TimelineItem key={edu.id}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {edu.degree}
              </Typography>
              <Typography color="text.secondary">{edu.institution}</Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="text.secondary"
            >
              <Calendar1Icon fontSize="small" />
              <Typography variant="body2">
                {edu.start_date} - {edu.end_date}
              </Typography>
            </Stack>
          </Stack>
          <Typography mt={1}>CGPA/Percentage: {edu.percentage}</Typography>
        </TimelineItem>
      ))}
    </Stack>
  </Box>
);
