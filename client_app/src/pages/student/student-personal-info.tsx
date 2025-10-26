import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function StudentDashboard() {
  interface Student {
    uid: string;
    department: string;
    batch: string;
    academic_year: string;
    gender: string;
    dob: string;
    contact: string;
    personal_email: string;
    cgpa?: number;
    attendance?: number;
    card: string;
    current_category: string;
    consent: string;
    is_dse_student: boolean;
    is_kt: boolean;
    is_blacklisted: boolean;
    academic_performance: Record<string, string | number>;
    academic_attendance: Record<string, number>;
    training_performance: Record<string, string | number>;
    training_attendance: Record<string, number>;
  }

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    axios.get("/api/student/info", { withCredentials: true })
      .then(res => setStudent(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!student) return <p className="p-6">Loading your dashboard...</p>;

  return (
    <div className="p-8 space-y-6">
      {/* Profile Info */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>UID:</strong> {student.uid}</p>
          <p><strong>Department:</strong> {student.department}</p>
          <p><strong>Batch:</strong> {student.batch}</p>
          <p><strong>Academic Year:</strong> {student.academic_year}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
          <p><strong>DOB:</strong> {student.dob}</p>
          <p><strong>Email:</strong> {student.personal_email}</p>
          <p><strong>CGPA:</strong> {student.cgpa ?? "N/A"}</p>
          <p><strong>Attendance:</strong> {student.attendance ?? "N/A"}%</p>
          <p><strong>Card Type:</strong> {student.card}</p>
          <p><strong>Category:</strong> {student.current_category}</p>
          <p><strong>Consent:</strong> {student.consent}</p>
          <p><strong>DSE Student:</strong> {student.is_dse_student ? "Yes" : "No"}</p>
          <p><strong>KT:</strong> {student.is_kt ? "Yes" : "No"}</p>
          <p><strong>Blacklisted:</strong> {student.is_blacklisted ? "Yes" : "No"}</p>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6">
            {Object.entries(student.academic_performance).map(([sem, perf]) => (
              <li key={sem}>{sem}: {perf}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Academic Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6">
            {Object.entries(student.academic_attendance).map(([sem, att]) => (
              <li key={sem}>{sem}: {att}%</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Training Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Training Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6">
            {Object.entries(student.training_performance).map(([sem, tp]) => (
              <li key={sem}>{sem}: {tp}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Training Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Training Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-6">
            {Object.entries(student.training_attendance).map(([sem, ta]) => (
              <li key={sem}>{sem}: {ta}%</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
