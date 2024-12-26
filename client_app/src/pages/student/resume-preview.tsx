import { useEffect, useState, useRef } from "react";
import { getCookie } from "../../utils";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Calendar, Mail, Phone } from "lucide-react";
export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone_no: string;
  education: {
    id: string;
    institution: string;
    degree: string;
    start_date: string;
    end_date: string;
    percentage: string;
  }[];
  projects: {
    id: string;
    title: string;
    description: string;
  }[];
  workExperience: {
    id: string;
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
  }[];
  contacts: string[];
  skills: string[];
}

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
          console.log(data);
          setResume(data);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch resume");
        toast.error("Failed to fetch resume");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <button
          onClick={() => handlePrint()}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors "
        >
          Download PDF
        </button>
        <div ref={componentRef} className="min-h-screen bg-white">
          <div className="bg-blue-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">{resumeData?.name}</h1>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{resumeData?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{resumeData?.phone_no}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href="http://github.com/r1i2t3" className="hover:underline">
                  github.com/r1i2t3
                </a>
              </div>
            </div>
          </div>
          <div className="p-8">
            {/* Education Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Education
              </h2>
              {resumeData?.education.map((edu) => (
                <div className="border-l-2 border-blue-600 pl-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {edu.start_date} - {edu.end_date}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">
                      CGPA/Percentage: {edu.percentage}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {/* Work Experience Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Work Experience
              </h2>
              {resumeData?.workExperience.map((work) => (
                <div className="border-l-2 border-blue-600 pl-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {work.position}
                        </h3>
                        <p className="text-gray-600">{work.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {work.start_date} - {work.end_date}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{work.description}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Projects Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Projects
              </h2>
              {resumeData?.projects.map((project) => (
                <div className="border-l-2 border-blue-600 pl-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Skills Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData?.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
