import { Card, CardContent } from "@/components/ui/card";
import { Capitalize } from "@/utils";
import { useEffect, useState } from "react";

interface StudentPersonalInfoProps {
  full_name: string;
  department: string;
  year: string;
  rollNo: string;
  batch: string;
}
const StudentPersonalInfo = () => {
  const [loading, setLoading] = useState(true);
  const [StudentData, setStudentData] = useState<StudentPersonalInfoProps>({
    full_name: "",
    department: "",
    year: "",
    rollNo: "",
    batch: "",
  });
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const response = await fetch("/api/student/info");
        const data = await response.json();
        console.log(data);
        setLoading(false);
        setStudentData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalInfo();
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <main className="w-[90%] md:w-3/4 p-6 space-y-4 mx-auto overflow-y-auto flex flex-col gap-3">
      {Object.entries(StudentData).map(([key, value]) => (
        <Card key={key}>
          <CardContent className="text-black py-3">
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "sans-serif" }}
            >
              {Capitalize(key)}
            </h1>
            <p className="text-gray-600">{Capitalize(value)}</p>
          </CardContent>
        </Card>
      ))}
    </main>
  );
};

export default StudentPersonalInfo;
