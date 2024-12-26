import React from "react";
import { Calendar, Mail, Phone, Github, Building2 } from "lucide-react";
import { ResumeData } from "../resume-preview";
interface ResumeProps {
  data: ResumeData;
}
const Resume = React.forwardRef<HTMLDivElement, ResumeProps>((props, ref) => {
  return (
    <div ref={ref} className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-blue-600 text-white px-8 py-6">
          <h1 className="text-3xl font-bold">Ritesh Jha</h1>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>jhar27018@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>9892879056</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              <a href="http://github.com/r1i2t3">github.com/r1i2t3</a>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Education Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>
            <div className="border-l-2 border-blue-600 pl-4">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">BE</h3>
                    <p className="text-gray-600">TCET</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>2022 - 2026</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-1">CGPA: 9.0</p>
              </div>
            </div>
          </section>

          {/* Work Experience Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Work Experience
            </h2>
            <div className="border-l-2 border-blue-600 pl-4">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Software Developer Intern
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Dinosys Infotech
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Dec 2023 - Apr 2024</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">This is description</p>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>
            <div className="border-l-2 border-blue-600 pl-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Localhost</h3>
                <p className="text-gray-600 mt-1">This is description</p>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "Python", "React"].map((skill) => (
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
  );
});

Resume.displayName = "Resume";

export default Resume;
