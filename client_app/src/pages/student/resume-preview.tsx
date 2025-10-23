import { useEffect, useState, useRef } from "react";
import { PrinterIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCookie } from "../../utils";
import { ResumeData } from "./types";
import ResumeDisplay from "./components/resume/ResumeDisplay";

const ResumePreview = () => {
  const [resumeData, setResume] = useState<ResumeData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("/api/student/resume/", {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRF-Token": getCookie("csrftoken") || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setResume(data);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch resume");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!resumeData) return null;
  console.log(resumeData);

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          onClick={() => handlePrint()}
          className="mb-6"
        >
          <PrinterIcon className="mr-2 h-4 w-4" />
          Download PDF
        </Button>

        <div ref={componentRef}>
          <ResumeDisplay resumeData={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;