import React from "react";
import TCETResumeHeader from "@/assets/img/tcet_resume_header.jpeg";
import { SERVER_URL } from "@/constant";

type Education = {
  id: string;
  institution: string;
  degree: string;
  start_date: string;
  end_date: string;
  percentage: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
};

type WorkExperience = {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Activity = {
  id: string;
  title: string;
  description: string;
};

type ResumeData = {
  name: string;
  email: string;
  phone_no: string;
  profile_image: string;
  education: Education[];
  projects: Project[];
  workExperience: WorkExperience[];
  activitiesAndAchievements: Activity[];
  contacts: string[];
  skills: string[];
};

interface ResumeDisplayProps {
  resumeData: ResumeData;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="break-inside-avoid-page bg-white shadow-none mb-5">
    <h2 className="text-[12pt] font-bold uppercase tracking-wide text-blue-700 mb-1">
      {title}
    </h2>
    <hr className="border-gray-400 mb-2" />
    {children}
  </div>
);

const HtmlContent: React.FC<{ content: string }> = ({ content }) => (
  <div
    className="text-[10pt] leading-tight text-black [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mt-1 [&_li]:mb-0.5"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ resumeData }) => {
  const formatContactUrl = (url: string) => {
    try {
      const { hostname, pathname } = new URL(url);
      return `${hostname.replace("www.", "")}${pathname.replace(/\/$/, "")}`;
    } catch (e) {
      return url;
    }
  };

  const parseSkill = (skillString: string) => {
    const parts = skillString.split(":");
    if (parts.length < 2) {
      return { category: "Skills", list: skillString };
    }
    return {
      category: parts[0].trim(),
      list: parts.slice(1).join(":").trim(),
    };
  };

  return (
    <div
      className="mx-auto bg-white"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '10pt',
        lineHeight: '1',
        maxWidth: '8.5in',
        padding: '0.5in 0.5in',
        minHeight: '11in',

      }}
    >
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .resume-container {
            font-size: 10pt !important;
            line-height: 1.15 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          .break-inside-avoid-page {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          p {
          color: black !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="flex justify-between items-start border-b border-gray-400 pb-2">
        <div className="flex-shrink-0">
          <img
            src={TCETResumeHeader}
            alt="TCET Header"
            className="w-[90px] h-[90px] object-contain"
          />
        </div>

        <div className="flex-1 mx-4 text-center">
          <h1 className="text-[16pt] font-bold text-black mb-1">
            {resumeData.name}
          </h1>
          <div className="text-[12pt] text-black leading-tight">
            <div className="mb-0.5">
              +91 {resumeData.phone_no} | {resumeData.email}
            </div>
            <div>
              {resumeData.contacts.map((contact, index) => (
                <React.Fragment key={index}>
                  {index > 0 && " | "}
                  <a
                    href={contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 no-underline text-[12pt]"
                  >
                    {formatContactUrl(contact)}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <img
            src={`${SERVER_URL}${resumeData.profile_image}`}
            alt="Profile"
            className="w-[90px] h-[90px] object-cover rounded"
          />
        </div>
      </header>

      {/* Education Section */}
      <Section title="Education">
        {resumeData.education.map((edu) => (
          <div key={edu.id}>
            <div className="flex justify-between items-baseline">
              <div className="text-[10pt] font-bold text-black">
                {edu.degree}, {edu.institution}, CGPA: {edu.percentage}/10
              </div>
              <div className="text-[10pt] text-black whitespace-nowrap ml-1">
                {edu.start_date} – {edu.end_date}
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Technical Skills Section */}
      <Section title="Technical Skills">
        <div>
          {resumeData.skills.map((skill, index) => {
            const { category, list } = parseSkill(skill);
            return (
              <div key={index} className="text-[10pt] leading-tight">
                <span className="font-bold text-black">{category}:</span>
                <span className="text-black"> {list}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Projects Section */}
      <Section title="Projects">
        {resumeData.projects.map((proj) => (
          <div key={proj.id} className="mb-2">
            <h3 className="text-[12pt] font-bold text-black mb-1">
              {proj.title}
            </h3>
            <HtmlContent content={proj.description} />
          </div>
        ))}
      </Section>

      {/* Experience Section */}
      <Section title="Experience">
        {resumeData.workExperience.map((work) => (
          <div key={work.id} className="mb-2">
            <div className="flex justify-between items-baseline mb-0.5">
              <h3 className="text-[12pt] font-bold text-black">
                {work.position}
              </h3>
              <span className="text-[10pt] text-black whitespace-nowrap ml-2">
                {work.start_date} – {work.end_date}
              </span>
            </div>
            <h4 className="text-[10pt] font-bold text-black mb-0.5">
              {work.company}
            </h4>
            <HtmlContent content={work.description} />
          </div>
        ))}
      </Section>

      {/* Activities Section */}
      <Section title="Activities">
        {resumeData.activitiesAndAchievements.map((activity) => (
          <div key={activity.id}>
            <HtmlContent content={activity.description} />
          </div>
        ))}
      </Section>
    </div>
  );
};


export default ResumeDisplay;