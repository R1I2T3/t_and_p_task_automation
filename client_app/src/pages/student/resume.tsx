import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Paper,
  ThemeProvider,
} from "@mui/material";
import theme from "../placement/components/theme";
import { PlusCircle, MinusCircle } from "lucide-react";
import { getCookie } from "@/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
const Resume = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    contacts: [""],
    skills: [""],
    education: [
      {
        degree: "",
        institution: "",
        start_date: "",
        end_date: "",
        percentage: "",
      },
    ],
    projects: [{ title: "", description: "" }],
    workExperience: [
      {
        company: "",
        position: "",
        description: "",
        start_date: "",
        end_date: "",
      },
    ],
  });
  const [isUpdate, setIsUpdate] = useState(false);
  useEffect(() => {
    const fetchResume = async () => {
      const res = await fetch("/api/student/resume/", {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCookie("csrftoken") || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsUpdate(true);
        console.log(data);
        setFormData(data);
      }
    };
    fetchResume();
  }, []);
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (
    section: keyof typeof formData,
    index: number,
    key: string | null,
    value: string
  ) => {
    // @ts-expect-error: Type 'string' is not assignable to type 'never'.
    const updatedArray = formData[section].map((item, i) =>
      i === index ? (key ? { ...item, [key]: value } : value) : item
    );
    setFormData({ ...formData, [section]: updatedArray });
  };

  const addNewField = (
    section: keyof typeof formData,
    defaultValue: (typeof formData)[typeof section][number]
  ) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], defaultValue],
    });
  };

  const removeField = (section: keyof typeof formData, index: number) => {
    // @ts-expect-error: Type 'string' is not assignable to type 'never'.
    const updatedArray = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updatedArray });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (isUpdate) {
      const res = await fetch("/api/student/resume/", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Resume updated successfully");
      }
    } else {
      console.log(formData);
      const res = await fetch("/api/student/resume/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Resume created successfully");
      }
    }
    setIsSubmitted(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            Resume Form
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <Box mb={2}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                color="primary"
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                color="primary"
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Phone number"
                value={formData.phone_no}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                required
                color="primary"
              />
            </Box>
            <Typography variant="h6" color="primary">
              Contacts
            </Typography>
            {formData.contacts.map((contact, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  type="url" // Updated to accept URLs
                  label={`Contact ${index + 1}`}
                  value={contact}
                  onChange={(e) =>
                    handleArrayChange("contacts", index, null, e.target.value)
                  }
                  required
                  helperText="Enter a valid URL (e.g., https://example.com)"
                />
                <IconButton
                  onClick={() => removeField("contacts", index)}
                  color="secondary"
                  disabled={formData.contacts.length === 1}
                >
                  <MinusCircle />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() => addNewField("contacts", "")}
              color="primary"
            >
              Add Contact
            </Button>

            {/* Skills */}
            <Typography variant="h6" mt={4} color="primary">
              Skills
            </Typography>
            {formData.skills.map((skill, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  label={`Skill ${index + 1}`}
                  value={skill}
                  onChange={(e) =>
                    handleArrayChange("skills", index, null, e.target.value)
                  }
                  required
                />
                <IconButton
                  onClick={() => removeField("skills", index)}
                  color="secondary"
                  disabled={formData.skills.length === 1}
                >
                  <MinusCircle />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() => addNewField("skills", "")}
              color="primary"
            >
              Add Skill
            </Button>

            {/* Education */}
            <Typography variant="h6" mt={4} color="primary">
              Education
            </Typography>
            {formData.education.map((edu, index) => (
              <Box key={index} mb={2}>
                <TextField
                  fullWidth
                  label="Institute Name"
                  value={edu.institution}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "institution",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Degree"
                  value={edu.degree}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "degree",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={edu.start_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "start_date",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={edu.end_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "end_date",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Percentage/CGPA"
                  value={edu.percentage}
                  type="number"
                  onChange={(e) =>
                    handleArrayChange(
                      "education",
                      index,
                      "percentage",
                      e.target.value
                    )
                  }
                  margin="dense"
                  multiline
                />
                <IconButton
                  onClick={() => removeField("education", index)}
                  color="secondary"
                  disabled={formData.workExperience.length === 1}
                >
                  <MinusCircle />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() =>
                addNewField("education", {
                  institution: "",
                  degree: "",
                  start_date: "",
                  end_date: "",
                  percentage: "",
                })
              }
              color="primary"
            >
              Add Work Experience
            </Button>
            {/* Projects */}
            <Typography variant="h6" mt={4} color="primary">
              Projects
            </Typography>
            {formData.projects.map((project, index) => (
              <Box key={index} mb={2}>
                <TextField
                  fullWidth
                  label="Project Title"
                  value={project.title}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Project Description"
                  value={project.description}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  margin="dense"
                  multiline
                  rows={3}
                />
                <IconButton
                  onClick={() => removeField("projects", index)}
                  color="secondary"
                  disabled={formData.projects.length === 1}
                >
                  <MinusCircle />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() =>
                addNewField("projects", { title: "", description: "" })
              }
              color="primary"
            >
              Add Project
            </Button>

            {/* Work Experience */}
            <Typography variant="h6" mt={4} color="primary">
              Work Experience
            </Typography>
            {formData.workExperience.map((work, index) => (
              <Box key={index} mb={2}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={work.company}
                  onChange={(e) =>
                    handleArrayChange(
                      "workExperience",
                      index,
                      "company",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Position"
                  value={work.position}
                  onChange={(e) =>
                    handleArrayChange(
                      "workExperience",
                      index,
                      "position",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={work.start_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "workExperience",
                      index,
                      "start_date",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={work.end_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "workExperience",
                      index,
                      "end_date",
                      e.target.value
                    )
                  }
                  required
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Project Description"
                  value={work.description}
                  onChange={(e) =>
                    handleArrayChange(
                      "workExperience",
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  margin="dense"
                  multiline
                  rows={3}
                />
                <IconButton
                  onClick={() => removeField("workExperience", index)}
                  color="secondary"
                  disabled={formData.workExperience.length === 1}
                >
                  <MinusCircle />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() =>
                addNewField("workExperience", {
                  company: "",
                  position: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                })
              }
              color="primary"
            >
              Add Work Experience
            </Button>

            {/* Submit Button */}
            <div className="flex justify-between mt-2 gap-2">
              <Button
                type="button"
                variant="contained"
                color="primary"
                className="w-full"
                onClick={() => navigate("/student/resume-preview")}
              >
                Preview
              </Button>
              <Button type="submit" variant="contained" className="w-full">
                {isUpdate ? "Update" : "Submit"}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Resume;
