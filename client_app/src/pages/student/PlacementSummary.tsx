import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { getCookie } from "@/utils";

interface Company {
  id: string;
  name: string;
}

interface PlacementItem {
  company: string;
  role: string;
  rounds: {
    attendance: string;
    aptitude: string;
    gd: string;
    caseStudy: string;
    hrRound: string;
  };
}

const PlacementSummary = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState(["All"]);
  const [placementData, setPlacementData] = useState<PlacementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const csrftoken = getCookie("csrftoken");

  useEffect(() => {
    axios
      .get("/api/placement/company/all", {
        headers: { "X-CSRFToken": csrftoken || "" },
        withCredentials: true,
      })
      .then((response) => {
        const formattedCompanies = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
        setCompanies([{ id: "All", name: "All" }, ...formattedCompanies]);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies");
      });
  }, []);

  useEffect(() => {
    axios
      .get("/api/placement/roles/", {
        headers: { "X-CSRFToken": csrftoken || "" },
        withCredentials: true,
      })
      .then((response) => {
        // Assuming response is an array of role names
        setRoles(["All", ...response.data]);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
        // Fallback: Use static roles or extract from placement data later
        setRoles(["All", "Software Engineer", "Data Analyst", "Product Manager"]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        let data = [];
        if (selectedCompany === "All") {
          const response = await axios.get(
            "/api/placement/job_application/all/",
            {
              headers: { "X-CSRFToken": csrftoken || "" },
              withCredentials: true,
            }
          );
          data = response.data.students || [];
        } else {
          const response = await axios.get(
            `/api/placement/job_application/company/get/${selectedCompany}/`,
            {
              headers: { "X-CSRFToken": csrftoken || "" },
              withCredentials: true,
            }
          );
          data = response.data.students || [];
        }

        const transformedData: PlacementItem[] = data.map((item: any) => ({
          company: item.company,
          role: item.role || "Unknown",
          rounds: {
            attendance: item.attendance ? "Cleared" : "Not Cleared",
            aptitude: item.aptitude ? "Cleared" : "Not Cleared",
            gd: item.gd ? "Cleared" : "Not Cleared",
            caseStudy: item.case_study ? "Cleared" : "Not Cleared",
            hrRound: item.hr_round ? "Cleared" : "Not Cleared",
          },
        }));
        setPlacementData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching placement data:", error);
        setError("Failed to fetch placement data");
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany]);

  const filteredData = placementData.filter(
    (item) => selectedRole === "All" || item.role === selectedRole
  );

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Placement Summary</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Company</label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Aptitude</TableHead>
              <TableHead>Group Discussion</TableHead>
              <TableHead>Case Study</TableHead>
              <TableHead>HR Round</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.company}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  {Object.entries(item.rounds).map(([key, value]) => (
                    <TableCell key={key}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          value === "Cleared"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {value}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No data available for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlacementSummary;
