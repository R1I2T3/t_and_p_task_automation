import { useEffect, useState, useRef } from "react";
import { Box, Button, Container, CircularProgress, Alert } from "@mui/material";
import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { getCookie } from "../../utils";
import { ResumeData } from "./types";
import { ResumeHeader } from "./components/resume/ResumeHeader";
import { EducationSection } from "./components/resume/Education";
import { WorkExperienceSection } from "./components/resume/WorkExperience";
import { ProjectsSection } from "./components/resume/ProjectSection";
import { SkillsSection } from "./components/resume/SkillSection";
const ResumePreview = () => {
  const [resumeData, setResume] = useState<ResumeData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("/api/student/resume/", {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRF-Token": getCookie("csrftoken") || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setResume(data);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch resume");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!resumeData) return null;
  console.log(resumeData);
  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Button
          variant="contained"
          startIcon={<PrinterIcon />}
          onClick={() => handlePrint()}
          sx={{ mb: 3 }}
        >
          Download PDF
        </Button>

        <Box
          ref={componentRef}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <ResumeHeader
            name={resumeData.name}
            email={resumeData.email}
            phone={resumeData.phone_no}
            contacts={resumeData.contacts}
          />
          <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <EducationSection education={resumeData.education} />
            <WorkExperienceSection workExperience={resumeData.workExperience} />
            <ProjectsSection projects={resumeData.projects} />
            <SkillsSection skills={resumeData.skills} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ResumePreview;
