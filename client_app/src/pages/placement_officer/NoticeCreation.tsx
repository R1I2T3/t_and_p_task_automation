/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";
import Notice from "./components/notice";
import { getCookie } from "../../utils";
import { NoticeData } from "./components/notice";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
// import PrintIcon from "@mui/icons-material/Print";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
import downloadWordDocument from "./utils/downloadWordDocument";

const NoticeCreationForm = () => {
  const [formData, setFormData] = useState({
    srNo: "",
    to: "",
    subject: "",
    date: "",
    intro: "",
    eligibility_criteria: "",
    roles: "",
    about: "",
    skill_required: "",
    Documents_to_Carry: "",
    Walk_in_interview: "",
    Company_registration_Link: "",
    Note: "",
    From: "",
    From_designation: "",
    company: "",
    location: "",
  });

  const toOptions = ["principal", "students", "internship officer", "faculty"];
  const contentRef = useRef<HTMLDivElement>(null);
  const [noticeData, setNoticeData] = useState<NoticeData | null>(null);
  const reactPrintFn = useReactToPrint({ contentRef });

  interface Company {
    id: number;
    name: string;
    batch: string;
  }

  const [companies, setCompanies] = useState<Company[]>([]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDownloadWord = () => {
    if (noticeData) {
      downloadWordDocument(noticeData);
    } else {
      console.log("No notice data available.");
    }
  };

  const csrfToken = getCookie("csrftoken");
  useEffect(() => {
    axios
      .get("/api/placement/company/all", {
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true, // Ensure cookies are included in the request
      })
      .then((response) => {
        const formattedCompanies = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          batch: item.batch,
        }));
        console.log(formattedCompanies);
        setCompanies(formattedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    axios
      .post(`/api/placement/notice/create/${formData.company}`, formData, {
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true,
      })
      .then((response) => {
        console.log("API Response Data:", response.data);
        setNoticeData(response.data.data);
        toast.success("Notice created successfully!");
      })
      .catch((error) => {
        console.error("Error creating notice:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to create notice!");
      });
  };

  const onPrint = () => {
    reactPrintFn();
  };

  // const onDelete = () => {
  //   console.log("Current noticeData:", noticeData);
  //   console.log("Notice Data Keys:", Object.keys(noticeData || {}));
  //   console.log("Notice ID being used:", noticeData?.noticeId);
  //   console.log("Full noticeData object:", JSON.stringify(noticeData, null, 2));

  //   if (noticeData?.noticeId) {
  //     console.log("Making delete request with ID:", noticeData.noticeId);
  //     console.log("Delete request URL:", `/api/placement/notice/delete/${noticeData.noticeId}/`);

  //     axios.delete(`/api/placement/notice/delete/${noticeData.noticeId}/`, {
  //       headers: {
  //         "X-CSRFToken": csrfToken || "",
  //       },
  //       withCredentials: true,
  //     }).then((response) => {
  //       console.log("Delete response:", response.data);
  //       toast.success("Notice deleted successfully!");
  //       setNoticeData(null);  // Clear the notice data after deletion
  //     }).catch((error) => {
  //       console.error("Error deleting notice:", error);
  //       console.error("Error details:", error.response?.data);
  //       toast.error("Failed to delete notice!");
  //     });
  //   } else {
  //     console.log("No noticeId found in noticeData");
  //     console.log("Available data:", JSON.stringify(noticeData, null, 2));
  //     toast.error("No notice selected to delete");
  //   }
  // };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Create Placement Notice
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                label="Select Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                fullWidth
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}-{company.batch}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sr No"
                name="srNo"
                value={formData.srNo}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="To"
                name="to"
                value={formData.to}
                onChange={handleChange}
                fullWidth
              >
                {toOptions.map((option, key) => (
                  <MenuItem key={key} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Introduction"
                name="intro"
                value={formData.intro}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Eligibility Criteria"
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Roles"
                name="roles"
                value={formData.roles}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About"
                name="about"
                value={formData.about}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Skills Required"
                name="skill_required"
                value={formData.skill_required}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Documents to Carry"
                name="Documents_to_Carry"
                value={formData.Documents_to_Carry}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Walk-in Interview Details"
                name="Walk_in_interview"
                value={formData.Walk_in_interview}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company Registration Link"
                name="Company_registration_Link"
                value={formData.Company_registration_Link}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Note"
                name="Note"
                value={formData.Note}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From"
                name="From"
                value={formData.From}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From Designation"
                name="From_designation"
                value={formData.From_designation}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Submit Notice
          </Button>
        </form>
      </Paper>
      {noticeData && (
        <div>
          <Notice formData={noticeData} ref={contentRef} isPlacement />
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              // startIcon={<PrintIcon />}
              onClick={onPrint}
              sx={{ px: 3, py: 1, fontWeight: "bold", borderRadius: "8px" }}
            >
              Print Notice
            </Button>

            <Button
              variant="contained"
              color="secondary"
              // startIcon={<FileDownloadIcon />}
              onClick={handleDownloadWord}
              sx={{ px: 3, py: 1, fontWeight: "bold", borderRadius: "8px" }}
            >
              Download as Word
            </Button>
          </Stack>
        </div>
      )}
    </Container>
  );
};

export default NoticeCreationForm;
