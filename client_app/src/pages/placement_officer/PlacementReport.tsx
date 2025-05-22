import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Grid,
} from "@mui/material";
import * as XLSX from "xlsx";

interface ReportData {
  companyName: string;
  employerCategory: string;
  placementType: string;
  salary: number;
  branchesData: Record<string, { selected: number; registered: number }>;
  totalSelected: number;
  totalRegistered: number;
}

const branches = [
  "COMP", "IT", "AI&DS", "AI&ML", "CSE", "E&CS", "E&TC", "MME", "MECH", "CIVIL", "IOT"
];

const PlacementReport = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get("/api/placement_officer/consolidated/");
        const data = processReportData(response.data);
        setReportData(data);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching placement report data:", error);
      }
    };

    fetchReportData();
  }, []);

  const processReportData = (apiData: any): ReportData[] => {
    const data: Record<string, ReportData> = {};
    const salaryMap: Record<string, number> = {};

    if (apiData.student_data && Array.isArray(apiData.student_data)) {
      apiData.student_data.forEach((item: any) => {
        const company_name = item["company__name"];
        const salary = item.salary;
        if (company_name && salary !== undefined) {
          if (!salaryMap[company_name] || salary > salaryMap[company_name]) {
            salaryMap[company_name] = salary;
          }
        }
      });
    }

    const pliMap: Record<string, boolean> = {};
    apiData.student_data.forEach((item: any) => {
      const company_name = item["company__name"];
      const is_pli = item["company__is_pli"];
      if (company_name && is_pli !== undefined) {
        pliMap[company_name] = pliMap[company_name] || is_pli;
      }
    });

    const companyBranchData = apiData.company_data;

    Object.keys(companyBranchData).forEach((companyName) => {
      const company = companyBranchData[companyName];
      const salary = salaryMap[companyName] || 0;
      const employerCategory = salary > 10 ? "Super Dream" : "Dream";
      const placementType = pliMap[companyName] ? "PLI" : "Non-PLI";
      const key = `${companyName}-${salary}`;

      if (!data[key]) {
        data[key] = {
          companyName,
          employerCategory,
          placementType,
          salary,
          branchesData: branches.reduce((acc, branch) => {
            acc[branch] = { selected: 0, registered: 0 };
            return acc;
          }, {} as Record<string, { selected: number; registered: number }>),
          totalSelected: 0,
          totalRegistered: 0
        };
      }

      const branchesInCompany = company.branch_data;
      Object.entries(branchesInCompany).forEach(([branch, branchData]: [string, any]) => {
        if (branches.includes(branch)) {
          data[key].branchesData[branch].selected += branchData.selected || 0;
          data[key].branchesData[branch].registered += branchData.registered || 0;
          data[key].totalSelected += branchData.selected || 0;
          data[key].totalRegistered += branchData.registered || 0;
        }
      });
    });

    return Object.values(data);
  };

  const exportToExcel = () => {
    const worksheetData = reportData.map((row) => {
      const branchCounts = branches.reduce((acc, branch) => {
        acc[`${branch} (Sel/Reg)`] = `${row.branchesData[branch].selected}/${row.branchesData[branch].registered}`;
        return acc;
      }, {} as any);

      return {
        "Company Name": row.companyName,
        "Employer Category": row.employerCategory,
        "Placement Type": row.placementType,
        "Salary Offered (LPA)": row.salary.toFixed(2),
        ...branchCounts,
        "TOTAL (Sel/Reg)": `${row.totalSelected}/${row.totalRegistered}`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Placement Report");
    XLSX.writeFile(workbook, "placement_report.xlsx");
  };

  return (
    <Container>
      {reportData.length === 0 || !stats ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
            <Typography variant="h3" align="center" gutterBottom>
              Placement Consolidated Report
            </Typography>

            <Grid container spacing={2} style={{ marginBottom: "20px" }}>
              <Grid item xs={6} md={3}><strong>Total Placed Students:</strong> {stats.total_placed_students}</Grid>
              <Grid item xs={6} md={3}><strong>Total Offers:</strong> {stats.total_accepted_offers}</Grid>
              <Grid item xs={6} md={3}><strong>Total Salary:</strong> {stats.total_salary_accepted} LPA</Grid>
              <Grid item xs={6} md={3}><strong>Average Salary:</strong> {stats.avg_salary_accepted} LPA</Grid>
              <Grid item xs={6} md={3}><strong>Max Salary:</strong> {stats.max_salary_accepted} LPA</Grid>
              <Grid item xs={6} md={3}><strong>Min Salary:</strong> {stats.min_salary_accepted} LPA</Grid>
            </Grid>

            <div id="report-table">
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Employer Category</TableCell>
                      <TableCell>Placement Type</TableCell>
                      <TableCell>Salary Offered</TableCell>
                      {branches.map((branch) => (
                        <TableCell key={branch}>{branch} (Sel/Reg)</TableCell>
                      ))}
                      <TableCell>TOTAL (Sel/Reg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.companyName}</TableCell>
                        <TableCell>{row.employerCategory}</TableCell>
                        <TableCell>{row.placementType}</TableCell>
                        <TableCell>{row.salary.toFixed(2)} LPA</TableCell>
                        {branches.map((branch) => (
                          <TableCell key={branch}>
                            {row.branchesData[branch].selected} / {row.branchesData[branch].registered}
                          </TableCell>
                        ))}
                        <TableCell>{row.totalSelected} / {row.totalRegistered}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button variant="contained" color="primary" onClick={exportToExcel}>Export to Excel</Button>
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default PlacementReport;
