import { useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import Notice from "./notice_preview";
import { useReactToPrint } from "react-to-print";
import { FormDataType } from "../../placement_company";
// import PrintIcon from "@mui/icons-material/Print";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";

interface Props {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
}

const CompanyNotice = ({ formData, setFormData }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const reactToPrintFn = useReactToPrint({ contentRef });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      Notice: {
        ...prev.Notice,
        [name]: value,
      },
    }));
  };

  const onPrint = () => {
    reactToPrintFn();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Create Placement Notice
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}></Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12}>
            <TextField
              label="Subject"
              name="subject"
              value={formData.Notice.subject}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.Notice.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              name="location"
              value={formData.Notice.location}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Introduction"
              name="intro"
              value={formData.Notice.intro}
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
              value={formData.Notice.about}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Company Registration Link"
              name="Company_registration_Link"
              value={formData.Notice.Company_registration_Link}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Note"
              name="Note"
              value={formData.Notice.Note}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="From"
              name="From"
              value={formData.Notice.From}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="From Designation"
              name="From_designation"
              value={formData.Notice.From_designation}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {formData.Notice && (
        <div>
          <Notice formData={formData} ref={contentRef} isPlacement />
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
          </Stack>
        </div>
      )}
    </Container>
  );
};

export default CompanyNotice;
