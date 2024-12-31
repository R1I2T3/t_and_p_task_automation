import React, { useEffect, useState } from "react";
import { AttendanceChart } from "./components/AttendanceChart";
import { PerformanceChart } from "./components/PerformanceChart";
import { InternshipChart } from "./components/InternShipChart";
import { PlacementChart } from "./components/PlaementChart";
import toast from "react-hot-toast";
interface DashboardProps {
  data: {
    academic_attendance: Record<string, number>;
    academic_performance: Record<string, number>;
    training_attendance: Record<string, number>;
    training_performance: Record<string, number>;
    internship: {
      branches: Record<string, number>;
      stipends: Record<string, number>;
    };
    placement: {
      [year: string]: Record<string, number>;
    };
  };
}

export default function DepartmentStats() {
  const [data, setData] = useState<DashboardProps["data"]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/department_coordinator/stats/");
        const data = await res.json();
        setData(data);
      } catch (error) {
        toast.error("Error fetching data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data to show</div>;
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Academic Analytics Dashboard
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Comprehensive overview of academic performance, attendance,
            internships, and placements
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AttendanceChart
            academicAttendance={data.academic_attendance}
            trainingAttendance={data.training_attendance}
          />
          <PerformanceChart
            academicPerformance={data.academic_performance}
            trainingPerformance={data.training_performance}
          />
          <InternshipChart
            branches={data.internship.branches}
            stipends={data.internship.stipends}
          />
          <PlacementChart data={data.placement} />
        </div>
      </div>
    </div>
  );
}
