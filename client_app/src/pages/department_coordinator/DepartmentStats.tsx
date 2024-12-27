/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import SideBar from "./components/SideBar";
const DepartmentStats = () => {
  const [averageAcademicAttendance, setAverageAcademicAttendance] = useState(
    {}
  );
  const [averageAcademicPerformance, setAverageAcademicPerformance] = useState(
    {}
  );
  const [averageTrainingAttendance, setAverageTrainingAttendance] = useState(
    {}
  );
  const [averageTrainingPerformance, setAverageTrainingPerformance] = useState(
    {}
  );
  const [internshipData, setInternshipData] = useState({
    it_branches: {},
    it_stipends: {},
  });
  const [placementData, setPlacementData] = useState({
    "2023": {},
    "2024": {},
  });
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "white",
        },
      },
      y: {
        ticks: {
          color: "white",
          beginAtZero: true,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  const dualBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "white",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  const academicAttendanceData = {
    labels: Object.keys(averageAcademicAttendance),
    datasets: [
      {
        label: "Average Academic Attendance (%)",
        data: Object.values(averageAcademicAttendance),
        backgroundColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  const academicPerformanceData = {
    labels: Object.keys(averageAcademicPerformance),
    datasets: [
      {
        label: "Average Academic Performance (%)",
        data: Object.values(averageAcademicPerformance),
        backgroundColor: "#f59e0b",
        borderWidth: 1,
      },
    ],
  };

  const trainingAttendanceData = {
    labels: Object.keys(averageTrainingAttendance),
    datasets: [
      {
        label: "Average Training Attendance (%)",
        data: Object.values(averageTrainingAttendance),
        backgroundColor: "#10b981",
        borderWidth: 1,
      },
    ],
  };

  const trainingPerformanceData = {
    labels: Object.keys(averageTrainingPerformance),
    datasets: [
      {
        label: "Average Training Performance (%)",
        data: Object.values(averageTrainingPerformance),
        backgroundColor: "#3b82f6",
        borderWidth: 1,
      },
    ],
  };

  const internshipChartData = {
    labels: Object.keys(internshipData.it_branches),
    datasets: [
      {
        label: "Class Data",
        data: Object.values(internshipData.it_branches),
        backgroundColor: "#ef4444",
      },
      {
        label: "Stipend (in INR)",
        data: Object.values(internshipData.it_stipends),
        backgroundColor: "#f59e0b",
      },
    ],
  };

  const placementChartData = {
    labels: Object.keys(placementData["2023"]),
    datasets: [
      {
        label: "2023",
        data: Object.values(placementData["2023"]),
        backgroundColor: "#ef4444",
      },
      {
        label: "2024",
        data: Object.values(placementData["2024"]),
        backgroundColor: "#f59e0b",
      },
    ],
  };

  return (
    <SideBar>
      <div>
        <div className="bg-[#153F74] rounded-lg shadow-lg h-[50vh] p-4 mb-4 flex flex-col">
          <h1 className="text-xl lg:text-2xl font-bold">Academic Details</h1>
          <div className="flex flex-col md:flex-row justify-between items-center w-full h-full mx-auto">
            <div className="w-full md:w-[35%] h-full border-white mb-4 md:mb-0">
              <Bar data={academicAttendanceData} options={barOptions} />
            </div>
            <div className="w-full h-full md:w-[35%]">
              <Bar data={academicPerformanceData} options={barOptions} />
            </div>
          </div>
        </div>
        <div className="bg-[#153F74] rounded-lg shadow-lg h-[50vh] p-4 mb-4 flex flex-col">
          <h1 className="text-xl lg:text-2xl font-bold">Training Details</h1>
          <div className="flex flex-col md:flex-row justify-between items-center w-full h-full mx-auto">
            <div className="w-full md:w-[35%] border-white h-full mb-4 md:mb-0">
              <Bar data={trainingAttendanceData} options={barOptions} />
            </div>
            <div className="w-full h-full md:w-[35%]">
              <Bar data={trainingPerformanceData} options={barOptions} />
            </div>
          </div>
        </div>
        <div className="bg-[#153F74] rounded-lg shadow-lg p-4 h-[50vh] mb-4 flex flex-col">
          <h1 className="text-xl lg:text-2xl font-bold">
            Placement and Internship Detail
          </h1>
          <div className="flex flex-col md:flex-row justify-between items-center w-full h-full mx-auto">
            <div className="w-full md:w-[35%] border-white mb-4 md:mb-0 h-[80%]">
              <h1>Internship Data</h1>
              <Bar data={internshipChartData} options={dualBarOptions} />
            </div>
            <div className="w-full md:w-[35%] h-[80%]">
              <h1>Placement Data</h1>
              <Bar data={placementChartData} options={dualBarOptions} />
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};

export default DepartmentStats;
