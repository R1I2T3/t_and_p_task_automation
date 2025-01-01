import { Box, Chip, Stack } from "@mui/material";
import { SectionTitle } from "./SectionTitle";

interface SkillsSectionProps {
  skills: string[];
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => (
  <Box component="section" sx={{ width: "95%", backgroundColor: "white" }}>
    <SectionTitle>Skills</SectionTitle>
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {skills.map((skill) => (
        <Chip
          key={skill}
          label={skill}
          color="primary"
          variant="outlined"
          sx={{ borderRadius: 4 }}
        />
      ))}
    </Stack>
  </Box>
);
