/* eslint-disable @typescript-eslint/no-unused-vars */
import{ useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { getCookie } from "../../utils";
import Logo from "../../assets/img/logo.png";

interface ResumeData {
  name: string;
  photo: string | null;
  department: string;
  email: string;
  phone_no: string;
  city: string;
  education: Array<{
    degree: string;
    institution: string;
    start_date: string;
    end_date: string;
    percentage: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    description: string;
    start_date: string;
    end_date: string;
  }>;
  extracurricular: string[];
}

const ResumePreview = () => {
  const [resumeData, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    // Fetch resume data from API
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
        } else {
          setError("Failed to fetch resume");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch resume");
      } finally {
        setLoading(false);
      }
    };

    // Retrieve profile photo from LocalStorage
    const storedPhoto = localStorage.getItem("profilePhoto");
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }

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

  // Extract year from date strings for education
  const getYear = (date: string) => date.split("-")[0] || date;
  // Extract month and year for work experience
  const getMonthYear = (date: string) => {
    const [year, month] = date.split("-").reverse();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
  };

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4, fontFamily: "Roboto, Arial, sans-serif" }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PrinterIcon />}
            onClick={() => handlePrint()}
            sx={{ flex: 1, bgcolor: "#003087", "&:hover": { bgcolor: "#002060" } }}
          >
            Download PDF
          </Button>
        </Box>

        <Box
          ref={componentRef}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            overflow: "hidden",
            width: "100%",
            boxShadow: 3,
            p: 2,
            "@media print": {
              boxShadow: "none",
              border: "1px solid #000",
              p: 0,
            },
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              bgcolor: "transparent",
              color: "black",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "@media print": { p: 1.5 },
            }}
          >
            {/* Logo on the Left */}
            <Box
              component="img"
              src={Logo}
              alt="TCET Logo"
              sx={{
                width: 100,
                height: 100,
                objectFit: "contain",
                "@media print": { width: 80, height: 80 },
              }}
            />

            {/* Personal Info Centered */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "20pt", sm: "24pt" },
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  color: "#000",
                }}
              >
                {resumeData.name || "N/A"}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: "12pt", sm: "14pt" },
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#000",
                }}
              >
                {resumeData.department || "N/A"}
              </Typography>
              <Box sx={{ mt: 1, fontSize: { xs: "9pt", sm: "10pt" }, color: "#000", whiteSpace: "nowrap" }}>
                <Typography variant="body2">
                  {`${resumeData.phone_no || "N/A"} | ${resumeData.email || "N/A"} | ${resumeData.city || "N/A"}`}
                </Typography>
              </Box>
            </Box>

            {/* Photo on the Right */}
            <Avatar
              src={profilePhoto || undefined}
              alt="Profile"
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                bgcolor: "#D3D3D3",
                "@media print": { width: 100, height: 100 },
              }}
            />
          </Box>

          {/* Main Content */}
          <Box sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Academic Qualifications */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#003087",
                }}
              >
                Academic Qualifications
              </Typography>
              <Divider sx={{ borderColor: "#000", my: 1 }} />
              {Array.isArray(resumeData.education) && resumeData.education.length > 0 ? (
                resumeData.education.map((edu, index) => (
                  <Box key={index} sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontSize: "12pt", fontWeight: "bold" }}>
                        {edu.degree || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "10pt", color: "#333" }}>
                        {edu.institution || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                        {edu.percentage ? `Passed with ${edu.percentage}` : "N/A"}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "10pt", color: "#666", ml: 2 }}>
                      {`${getYear(edu.start_date)} - ${getYear(edu.end_date) || "Present"}`}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                  No academic qualifications provided.
                </Typography>
              )}
            </Box>

            {/* Skills */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#003087",
                }}
              >
                Skills
              </Typography>
              <Divider sx={{ borderColor: "#000", my: 1 }} />
              {Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {resumeData.skills.map((skill, index) => (
                    <Typography
                      key={index}
                      sx={{
                        fontSize: "10pt",
                        color: "#333",
                        "&:after": {
                          content: '" |"',
                          color: "#666",
                          mx: 0.5,
                        },
                        "&:last-child:after": { content: "none" },
                      }}
                    >
                      {skill || "N/A"}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                  No skills provided.
                </Typography>
              )}
            </Box>

            {/* Projects */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#003087",
                }}
              >
                Projects
              </Typography>
              <Divider sx={{ borderColor: "#000", my: 1 }} />
              {Array.isArray(resumeData.projects) && resumeData.projects.length > 0 ? (
                resumeData.projects.map((project, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "12pt", fontWeight: "bold" }}>
                      {project.title || "N/A"}
                    </Typography>
                    <Typography sx={{ fontSize: "10pt", color: "#333" }}>
                      {project.description || "No description provided."}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                  No projects provided.
                </Typography>
              )}
            </Box>

            {/* Internships */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#003087",
                }}
              >
                Internships
              </Typography>
              <Divider sx={{ borderColor: "#000", my: 1 }} />
              {Array.isArray(resumeData.workExperience) && resumeData.workExperience.length > 0 ? (
                resumeData.workExperience.map((work, index) => (
                  <Box key={index} sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontSize: "12pt", fontWeight: "bold" }}>
                        {work.position || "N/A"} | {work.company || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "10pt", color: "#333" }}>
                        {work.description || "No description provided."}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "10pt", color: "#666", ml: 2 }}>
                      {`${getMonthYear(work.start_date)} - ${getMonthYear(work.end_date) || "Present"}`}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                  No internships provided.
                </Typography>
              )}
            </Box>

            {/* Co/Extra-Curricular Activities */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "14pt",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#003087",
                }}
              >
                Co/Extra-Curricular Activities
              </Typography>
              <Divider sx={{ borderColor: "#000", my: 1 }} />
              {Array.isArray(resumeData.extracurricular) && resumeData.extracurricular.length > 0 ? (
                resumeData.extracurricular.map((activity, index) => (
                  <Typography
                    key={index}
                    sx={{ fontSize: "10pt", color: "#333", mb: 0.5 }}
                  >
                    • {activity || "N/A"}
                  </Typography>
                ))
              ) : (
                <Typography sx={{ fontSize: "10pt", color: "#666" }}>
                  No activities provided.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ResumePreview;