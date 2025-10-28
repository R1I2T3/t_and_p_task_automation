import { forwardRef } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Paper,
} from "@mui/material";
import { StudentFormData } from "../../types";

type Props = {
  formData: StudentFormData;
};

const Placement = forwardRef<HTMLDivElement, Props>(({ formData }, ref) => {
  const { user, uid } = formData;
  const [year, branchDivRoll] = uid.split("-");
  const branch = branchDivRoll.slice(0, 2);
  const division = branchDivRoll.charAt(2);
  const rollNo = branchDivRoll.slice(3);

  return (
    <Container
      ref={ref}
      maxWidth="md"
      sx={{
        fontFamily: "Arial, sans-serif",
        padding: "40px",
        backgroundColor: "#fff",
        color: "#000",
        pageBreakInside: "avoid",
      }}
    >
      <Typography variant="h6" align="center" sx={{ textDecoration: "underline", fontWeight: "bold", mb: 3 }}>
        UNDERTAKING
      </Typography>

      <Typography paragraph>
        I, Mr. / Ms. <strong>{user.full_name}</strong>, student of 20{year} Batch<br />
        branch, Division <u>{branch}, {division}</u>, Roll No.: <u>{rollNo}</u><br />
        UID No. <strong>{uid}</strong>, Thakur College of Engineering and Technology, Kandivali,<br />
        Mumbai, residing at <u>________________________________________</u>
      </Typography>

      <Typography paragraph>
        hereby state that I am interested in and have given consent for <strong>Higher Studies</strong> and not interested in Campus Recruitment. I state and abide myself by the following:
      </Typography>

      <Box component="ol" sx={{ pl: 3 }}>
        <li>
          I will register myself for the Higher Studies to HOC Cell as per the instructions.
        </li>
        <li>
          I am interested in Higher Studies and I will not opt for Campus Recruitment in future.
        </li>
        <li>
          I assure that I will not change the consent of Higher Studies for Campus Recruitment in any circumstances.
        </li>
        <li>
          I will be submitting the following to T & P Cell:
          <Box component="ul" sx={{ pl: 3, listStyle: "lower-alpha" }}>
            <li>Admit Card</li>
            <li>Competitive Examination Score</li>
            <li>Photo Copy of LOR</li>
            <li>Any other communication received from institutions online / offline.</li>
          </Box>
        </li>
        <li>
          I have complete awareness that institute’s decision will be the final decision in this regard.
        </li>
        <li>
          If I do not abide by the decisions, rules and regulations of T & P Cell then I am ready to accept the action taken by the institute and T & P Cell.
        </li>
      </Box>

      <Typography sx={{ mt: 2 }}>Place: Mumbai</Typography>
      <Typography>Date: _______________________</Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>Details</TableCell>
              <TableCell sx={{ border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>For Students</TableCell>
              <TableCell sx={{ border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>For Parent</TableCell>
              <TableCell sx={{ border: "1px solid #000", fontWeight: "bold", textAlign: "center" }}>
                Teacher Guardian<br />(For information)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ border: "1px solid #000" }}>Name</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}>{user.full_name}</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ border: "1px solid #000" }}>Signature</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ border: "1px solid #000" }}>Contact No.</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ border: "1px solid #000" }}>Email ID</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}>{user.email}</TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
              <TableCell sx={{ border: "1px solid #000" }}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
});

export default Placement;
