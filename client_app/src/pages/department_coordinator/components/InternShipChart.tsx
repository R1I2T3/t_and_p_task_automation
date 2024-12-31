import React from "react";
import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import "./Charts";

interface InternshipChartProps {
  branches: Record<string, number>;
  stipends: Record<string, number>;
}

export function InternshipChart({ branches, stipends }: InternshipChartProps) {
  const labels = Object.keys(branches);
  const data = {
    labels,
    datasets: [
      {
        label: "Internship Rate",
        data: Object.values(branches),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Average Stipend (₹)",
        data: Object.values(stipends),
        borderColor: "rgba(236, 72, 153, 1)",
        backgroundColor: "rgba(236, 72, 153, 0.2)",
        fill: true,
        tension: 0.4,
        yAxisID: "stipend",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Internship Rate (%)",
        },
      },
      stipend: {
        position: "right" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Stipend (₹)",
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Internship Analytics</h3>
      <Line data={data} options={options} />
    </Card>
  );
}
