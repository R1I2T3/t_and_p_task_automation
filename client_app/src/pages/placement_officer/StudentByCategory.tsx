import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { getCookie } from "@/utils";

interface Student {
  uid: string;
  current_category: string;
  department: string;
  academic_year: string;
  batch: string | null;
  consent: string;
  contact: string | null;
  // Add other student fields if needed (e.g., name)
}

const StudentsByCategory = () => {
  const { category, batch } = useParams<{ category: string; batch: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const csrftoken = getCookie("csrftoken");
      try {
        const response = await axios.get(`/api/placement_officer/students/by-category/${category}/${batch}/`, {
          headers: { "X-CSRFToken": csrftoken || "" },
          withCredentials: true,
        });
        setStudents(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(`Failed to fetch students: ${err.response?.data?.error || "Unknown error"}`);
        setLoading(false);
      }
    };
    fetchStudents();
  }, [category, batch]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Students in {category?.replace("Category_", "Category ")} for Batch {batch}
      </h1>
      {students.length === 0 ? (
        <p>No students found for this category and batch.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">UID</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">Academic Year</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Batch</th>
                <th className="px-4 py-2 border">Consent</th>
                <th className="px-4 py-2 border">Contact</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.uid} className="border-t">
                  <td className="px-4 py-2 border">{student.uid}</td>
                  <td className="px-4 py-2 border">{student.department}</td>
                  <td className="px-4 py-2 border">{student.current_category}</td>
                  <td className="px-4 py-2 border">{student.academic_year}</td>
                  <td className="px-4 py-2 border">{student.batch || "-"}</td>
                  <td className="px-4 py-2 border">{student.consent}</td>
                  <td className="px-4 py-2 border">{student.contact || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentsByCategory;