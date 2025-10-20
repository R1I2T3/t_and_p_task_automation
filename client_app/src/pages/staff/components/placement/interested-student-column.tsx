"use client"; // Required for client components

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { InterestedStudentApplication } from "../../types/index";

export const interestedStudentColumns: ColumnDef<InterestedStudentApplication>[] =
  [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "student.uid",
      header: "UID",
    },
    {
      header: "Name",
      accessorKey: "student.full_name",
    },
    {
      accessorKey: "student.personal_email",
      header: "Email",
    },
    {
      accessorKey: "student.department",
      header: "Department",
    },
    {
      accessorKey: "student.cgpa",
      header: "CGPA",
    },
    {
      accessorKey: "progress.aptitude_test",
      header: "Aptitude",
      cell: ({ row }) => {
        const passed = row.original.progress.aptitude_test;
        return passed ? (
          <Badge variant="default">Passed</Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        );
      },
    },
    {
      accessorKey: "progress.final_result",
      header: "Final Result",
      cell: ({ row }) => {
        const result = row.original.progress.final_result;
        let variant: "default" | "destructive" | "outline" = "outline";
        if (result === "Selected") variant = "default";
        if (result === "Rejected") variant = "destructive";

        return <Badge variant={variant}>{result}</Badge>;
      },
    },
  ];