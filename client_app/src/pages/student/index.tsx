/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const StudentHome = () => {
  const [academicAttendance, setAcademicAttendance] = useState({});
  const [trainingAttendance, setTrainingAttendance] = useState({});
  const [academicPerformance, setAcademicPerformance] = useState({});
  const [trainingPerformance, setTrainingPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/student/", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch data");
        }

        const data = await res.json();
        console.log("Raw API Response:", data); // Debug log

        // Validate data structure
        if (!data || typeof data !== "object") {
          throw new Error("Invalid data format received");
        }

        // @ts-expect-error: TS doesn't know the shape of the data
        const validateData = (dataSet, name) => {
          if (!dataSet || typeof dataSet !== "object") {
            console.error(`Invalid ${name} data:`, dataSet);
            return {};
          }
          // Ensure all values are numbers
          return Object.fromEntries(
            Object.entries(dataSet).filter(
              ([_, value]) => !isNaN(Number(value))
            )
          );
        };

        setAcademicAttendance(
          validateData(data.academic_attendance, "academicAttendance")
        );
        setTrainingAttendance(
          validateData(data.training_attendance, "trainingAttendance")
        );
        setAcademicPerformance(
          validateData(data.academic_performance, "academicPerformance")
        );
        setTrainingPerformance(
          validateData(data.training_performance, "trainingPerformance")
        );
      } catch (error) {
        console.error("Fetch error:", error);
        // @ts-expect-error: TS doesn't know the shape of the data
        setError(error.message);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // @ts-expect-error: TS doesn't know the shape of the data
  const renderChart = (data, type, options = {}) => {
    // Debug log for chart data
    console.log(`Rendering ${type} chart with data:`, data);

    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const chartProps = {
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor:
              type === "bar"
                ? ["#0EA5E9", "#0EA5E9", "#0EA5E9"]
                : ["#F59E0B", "#EF4444"],
            borderColor: type === "bar" ? "#0369A1" : undefined,
            borderWidth: type === "bar" ? 1 : 0,
            label: type === "bar" ? "Percentage" : undefined,
          },
        ],
      },
      options: {
        ...options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === "pie",
            position: type === "pie" ? ("right" as const) : undefined,
            labels: {
              color: "#1F2937",
              font: {
                size: 12,
              },
            },
          },
        },
        scales:
          type === "bar"
            ? {
                x: {
                  grid: { display: false },
                  ticks: { color: "#1F2937" },
                },
                y: {
                  grid: { color: "#E5E7EB" },
                  ticks: {
                    color: "#1F2937",
                    beginAtZero: true,
                    // @ts-expect-error: TS doesn't know the shape of the data
                    callback: (value) => `${value}%`,
                  },
                },
              }
            : undefined,
      },
    };

    return type === "bar" ? <Bar {...chartProps} /> : <Pie {...chartProps} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Academic Attendance
          </h2>
          <div className="h-64">{renderChart(academicAttendance, "bar")}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Attendance
          </h2>
          <div className="h-64">{renderChart(trainingAttendance, "pie")}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Academic Performance
          </h2>
          <div className="h-64">{renderChart(academicPerformance, "bar")}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Training Performance
          </h2>
          <div className="h-64">{renderChart(trainingPerformance, "bar")}</div>
        </div>
      </div>
    </main>
  );
};

export default StudentHome;
