import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, MenuItem, Button, Stack } from "@mui/material";
import Papa from "papaparse";
type ReportData = {
  id: number;
  role: string;
  salary: string;
  form__name: string;
  form__notice__date: string;
  [key: string]: any;
};

const DEPARTMENTS_TO_DISPLAY = [
  "AI&DS",
  "AI&ML",
  "IoT",
  "COMP",
  "CS&E",
  "E&CS",
  "E&TC",
  "IT",
  "Mech",
  "MME",
  "CIVIL",
];

const getDeptApiKey = (dept: string) => {
  return dept
    .toLowerCase()
    .replace("&", "")
    .replace(" ", "_")
    .replace("-", "_");
};

const columns: ColumnDef<ReportData>[] = [
  {
    header: "Sr. No.",
    id: "sr_no",
    cell: ({ row }) => row.index + 1,
  },
  {
    header: "Date of Visit",
    accessorKey: "form__notice__date",
    cell: ({ getValue }) => {
      const dateString = getValue() as string;
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-IN");
    },
  },
  {
    header: "Name of Employer",
    accessorKey: "form__name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.form__name}</div>
        <div className="text-xs text-muted-foreground">{row.original.role}</div>
      </div>
    ),
  },
  {
    header: "Employer Type",
    accessorKey: "employee_type",
  },
  {
    header: "Salary Offered",
    accessorKey: "salary",
  },
  ...DEPARTMENTS_TO_DISPLAY.map((dept) => {
    const appliedKey = `applied_${getDeptApiKey(dept)}`;
    const selectedKey = `selected_${getDeptApiKey(dept)}`;
    return {
      header: dept,
      columns: [
        {
          header: "Appeared & Register",
          accessorKey: appliedKey,
        },
        {
          header: "Selected",
          accessorKey: selectedKey,
        },
      ],
    } as ColumnDef<ReportData>;
  }),
];

export function ConsolidationReportPage() {
  const [data, setData] = useState<ReportData[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [batches, setBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/companies/batches/")
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error("Error fetching batches:", err));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/placement_officer/get_data_by_year/${selectedBatch}`
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (selectedBatch) fetchData();
  }, [selectedBatch]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `consolidation_report_${selectedBatch}.csv`);
    link.click();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          marginTop: 100,
        }}
      >
        <Select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          displayEmpty
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Select Batch</MenuItem>
          {batches.map((batch) => (
            <MenuItem key={batch} value={batch}>
              {batch}
            </MenuItem>
          ))}
        </Select>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={!data.length}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </Stack>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Consolidation Report</h1>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
