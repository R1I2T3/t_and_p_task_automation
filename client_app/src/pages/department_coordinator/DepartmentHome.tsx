import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import Sidebar from "./components/SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Student {
  uid: string;
  department: string;
  academic_year: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface DepartmentStats {
  total_students: number;
  fe_count: number;
  se_count: number;
  te_count: number;
  be_count: number;
  department_students: Student[];
}

const DepartmentHome = () => {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState<DepartmentStats>({
    total_students: 0,
    fe_count: 0,
    se_count: 0,
    te_count: 0,
    be_count: 0,
    department_students: [],
  });

  useEffect(() => {
    fetchDepartmentStats();
  }, [searchParams]);

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch(
        `/api/department_coordinator/?year=${searchParams.get("year") || ""}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching department stats:", error);
    }
  };

  const handleYearFilter = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (year === "All") {
      params.delete("year");
    } else {
      params.set("year", year);
    }
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  return (
    <Sidebar>
      <div className="relative p-6">
        <Card className="bg-[#153F74] text-white mb-6">
          <CardContent className="p-6">
            <Card className="bg-white text-[#153F74] w-1/5   mx-auto mb-6">
              <CardHeader>
                <CardTitle className="text-center">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-center">
                  {stats.total_students}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-4 gap-6">
              {[
                { title: "FE/FT", count: stats.fe_count },
                { title: "SE/ST", count: stats.se_count },
                { title: "TE/TT", count: stats.te_count },
                { title: "BE/BT", count: stats.be_count },
              ].map((item) => (
                <Card key={item.title} className="bg-white text-[#153F74]">
                  <CardHeader>
                    <CardTitle className="text-center">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-center">
                      {item.count}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end items-center my-4">
          {["All", "FE", "SE", "TE", "BE"].map((year) => (
            <Button
              key={year}
              onClick={() => handleYearFilter(year)}
              variant={
                searchParams.get("year") === year ||
                (!searchParams.get("year") && year === "All")
                  ? "default"
                  : "outline"
              }
              className="ml-2"
            >
              {year}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.department_students.map((student, index) => (
                  <TableRow key={student.uid}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.user.full_name}</TableCell>
                    <TableCell>{student.uid}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.academic_year}</TableCell>
                    <TableCell>{student.user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  );
};

export default DepartmentHome;
