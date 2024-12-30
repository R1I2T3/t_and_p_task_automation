import React, { useState, useEffect } from "react";
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
  const [year, setYear] = useState("All");
  const [stats, setStats] = useState<DepartmentStats>({
    total_students: 0,
    fe_count: 0,
    se_count: 0,
    te_count: 0,
    be_count: 0,
    department_students: [],
  });
  const itemsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState<Student[]>();

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch(`/api/department_coordinator/`);
      const data = await response.json();
      console.log(data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching department stats:", error);
    }
  };

  const handleYearFilter = (year: string) => {
    if (year === "All") {
      setYear("");
      setSelected(stats.department_students);
    } else {
      setYear(year);
      setSelected(
        stats.department_students.filter((student) => {
          return student.academic_year === year;
        })
      );
    }
  };
  console.log(year);
  return (
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
                  <p className="text-2xl font-bold text-center">{item.count}</p>
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
            className="ml-2"
          >
            {year}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected &&
                  selected
                    .slice(
                      currentPage * itemsPerPage,
                      (currentPage + 1) * itemsPerPage
                    )
                    .map((student, index) => (
                      <TableRow key={student.uid}>
                        <TableCell>
                          {currentPage * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{student.user.full_name}</TableCell>
                        <TableCell>{student.uid}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.academic_year}</TableCell>
                        <TableCell>{student.user.email}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            <div className="flex justify-end items-center space-x-2 mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span>
                Page {currentPage + 1} of{" "}
                {Math.ceil((selected?.length || 0) / itemsPerPage)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      Math.ceil((selected?.length || 0) / itemsPerPage) - 1,
                      prev + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil((selected?.length || 0) / itemsPerPage) - 1
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentHome;
