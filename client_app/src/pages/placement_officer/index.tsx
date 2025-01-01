import { useState, useEffect } from "react";
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/utils";
import toast from "react-hot-toast";
// import "./placement.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
const PlacementStats = () => {
  const [year, setYear] = useState("BE");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  interface ConsentData extends ChartDataItem {
    consent: string;
    count: number;
  }
  const [consentData, setConsentData] = useState<ConsentData[]>([]);
  const [departmentData, setDepartmentData] = useState([]);
  interface CategoryData {
    current_category: string;
    count: number;
  }
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  interface TopCompanyData {
    company__name: string;
    count: number;
  }
  const [topCompanies, setTopCompanies] = useState<TopCompanyData[]>([]);
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    // if (year === 2024) {
    //   window.location.href = '/placement/2024';
    // }

    const fetchData = async () => {
      try {
        const consentResponse = await axios.get(
          `/api/placement_officer/consent/${year}/`
        );
        const data = consentResponse.data;
        if (data.consent_graph) {
          setConsentData(JSON.parse(data.consent_graph));
        }
        if (data.consent_counts_by_branch) {
          setDepartmentData(JSON.parse(data.consent_counts_by_branch));
        }
      } catch (error) {
        console.error("Error fetching consent data:", error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `/api/placement_officer/unique-departments/${year}/`
        );
        setDepartments(response.data.unique_departments);
      } catch (error) {
        console.error("Error fetching unique departments:", error);
      }
    };

    const fetchCategoryData = async () => {
      try {
        const response = await axios.get(
          `/api/placement_officer/get_category_data/${year}/`
        );
        setCategoryData(response.data.category);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    const fetchTopCompaniesWithOffers = async () => {
      try {
        const response = await axios.get(
          `/api/placement_officer/get_top_companies_with_offers/`
        );
        setTopCompanies(response.data.top_companies);
      } catch (error) {
        console.error("Error fetching top companies:", error);
      }
    };

    const fetchCompaniesName = async () => {
      try {
        const response = await axios.get(
          `/api/placement_officer/get_all_companies/`
        );
        setCompanies(response.data.companies);
      } catch (error) {
        console.error("Error fetching company names:", error);
      }
    };

    fetchData();
    fetchDepartments();
    fetchCategoryData();
    fetchTopCompaniesWithOffers();
    fetchCompaniesName();
  }, [year]);
  const handleDepartmentChange = async (e: SelectChangeEvent) => {
    const selectedDept = e.target.value;
    setSelectedDepartment(selectedDept);

    try {
      const consentUrl = selectedDept
        ? `/api/placement_officer/filter/${selectedDept}/${year}/`
        : `/api/placement_officer/consent/${year}/`;

      const categoryUrl = selectedDept
        ? `/api/placement_officer/get_category_data_by_department/${selectedDept}/${year}/`
        : `/api/placement_officer/get_category_data/${year}/`;

      const consentResponse = await axios.get(consentUrl);
      if (selectedDept && consentResponse.data.filtered_data) {
        setConsentData(JSON.parse(consentResponse.data.filtered_data));
      } else {
        const data = consentResponse.data;
        if (data.consent_graph) {
          setConsentData(JSON.parse(data.consent_graph));
        }
        if (data.consent_counts_by_branch) {
          setDepartmentData(JSON.parse(data.consent_counts_by_branch));
        }
      }

      const categoryResponse = await axios.get(categoryUrl);
      setCategoryData(categoryResponse.data.category);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  interface ChartDataItem {
    [key: string]: string | number;
  }

  const getChartData = (
    data: ChartDataItem[],
    labelKey: string,
    valueKey: string
  ) => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    const total = data.reduce((sum, item) => sum + Number(item[valueKey]), 0);
    return {
      labels: data.map((item) => item[labelKey]),
      datasets: [
        {
          label: "Percentage",
          data: data.map((item) =>
            ((Number(item[valueKey]) / total) * 100).toFixed(2)
          ),
          backgroundColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  const calculateCategory = async () => {
    try {
      const response = await fetch(
        `/api/placement_officer/calculate_category/`,
        {
          method: "POST",
          headers: {
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Category calculated successfully");
      } else {
        toast.error("Error calculating category");
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  return (
    <div>
      <div className="main-content">
        <Typography variant="h4" gutterBottom>
          Placement Statistics
        </Typography>
      </div>

      <div className="statistic">
        <div className="w-full flex justify-between items-center">
          <Button
            className="bg-orange-500 text-white p-2 rounded-md"
            onClick={calculateCategory}
          >
            Calculate Category
          </Button>
          <Link
            to="/placement_officer/2024"
            className="text-end bg-orange-500 text-white p-2  rounded-md"
          >
            View old Data
          </Link>
        </div>
        <br />
        <br />
        <br />
        {consentData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                  <InputLabel id="department-select-label">
                    Select Department
                  </InputLabel>
                  <Select
                    labelId="department-select-label"
                    id="department-select"
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Pie
                  data={getChartData(consentData, "consent", "count")}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: "#000000" },
                      },
                      title: {
                        display: true,
                        text: "Placement Consent Distribution",
                        color: "#000000",
                      },
                    },
                  }}
                />
              </Box>
              {consentData && (
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="h6">Consent Data:</Typography>
                  <table>
                    <thead>
                      <tr>
                        <th>Consent</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consentData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.consent}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </Grid>
            {selectedDepartment === "" && departmentData && (
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: "400px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Bar
                    data={getChartData(departmentData, "department", "count")}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: "#000000" },
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Department-Wise Distribution",
                          color: "#000000",
                        },
                      },
                      scales: {
                        x: { ticks: { color: "#000000" } },
                        y: { ticks: { color: "#000000" } },
                      },
                    }}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Category Data
                </Typography>
                {categoryData ? (
                  <Bar
                    data={getChartData(
                      // @ts-expect-error - ChartJS types are not up-to-date
                      categoryData,
                      "current_category",
                      "count"
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: "#000000" },
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Category-Wise Distribution",
                          color: "#000000",
                        },
                      },
                      scales: {
                        x: { ticks: { color: "#000000" } },
                        y: { ticks: { color: "#000000" } },
                      },
                    }}
                  />
                ) : (
                  <Typography>Loading category data...</Typography>
                )}
                {categoryData ? (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.current_category}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography>Loading category data...</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginTop: 18,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Top Companies
                </Typography>
                {topCompanies ? (
                  <Bar
                    // @ts-expect-error - ChartJS types are not up-to-date
                    data={getChartData(topCompanies, "company__name", "count")}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: "#000000" },
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Top Companies by Offers",
                          color: "#000000",
                        },
                      },
                      scales: {
                        x: { ticks: { color: "#000000" } },
                        y: { ticks: { color: "#000000" } },
                      },
                    }}
                  />
                ) : (
                  <Typography>Loading company data...</Typography>
                )}
                {topCompanies ? (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCompanies.map((item, index) => (
                          <tr key={index}>
                            <td>{item.company__name}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography>Loading company data...</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: "400px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  marginTop: 28,
                }}
              >
                {companies ? (
                  <div>
                    <Typography variant="h6">All Companies:</Typography>
                    <table>
                      <thead>
                        <tr>
                          <th>Company Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map((company, index) => (
                          <tr key={index}>
                            <td>{company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography>Loading company data...</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </div>
    </div>
  );
};

export default PlacementStats;
