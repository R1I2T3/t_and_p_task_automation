import React from 'react';

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
  <section className="mb-4">
    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 border-b-2 border-gray-300 pb-1 mb-2">
      {title}
    </h2>
    {children}
  </section>
);

const HtmlContent: React.FC<{ content: string }> = ({ content }) => (
  <div
    className="prose prose-sm max-w-none text-gray-700"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);


const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ resumeData }) => {
  const formatContactUrl = (url: string) => {
    try {
      const { hostname, pathname } = new URL(url);
      return `${hostname.replace('www.', '')}${pathname.replace(/\/$/, '')}`;
    } catch (e) {
      return url;
    }
  };

  const parseSkill = (skillString: string) => {
    const parts = skillString.split(':');
    if (parts.length < 2) {
      return { category: 'Skills', list: skillString };
    }
    return {
      category: parts[0],
      list: parts.slice(1).join(':'),
    };
  };

  return (
    <div className="font-sans max-w-3xl mx-auto p-8 md:p-12 bg-white shadow-lg my-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{resumeData.name}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
          <span>+91 {resumeData.phone_no}</span>
          <span>|</span>
          <span>{resumeData.email}</span>
          {resumeData.contacts.map((contact, index) => (
            <React.Fragment key={index}>
              <span>|</span>
              <a
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {formatContactUrl(contact)}
              </a>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* 2. Education Section */}
      <Section title="Education">
        {resumeData.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800">
                {edu.degree}, {edu.institution}
              </h3>
              <span className="text-sm font-medium text-gray-700">
                CGPA: {edu.percentage}/10
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {edu.start_date} – {edu.end_date}
            </p>
          </div>
        ))}
      </Section>

      {/* 3. Technical Skills Section */}
      <Section title="Technical Skills">
        <div className="space-y-1">
          {resumeData.skills.map((skill, index) => {
            const { category, list } = parseSkill(skill);
            return (
              <div key={index} className="text-sm">
                <span className="font-semibold text-gray-800">
                  {category}:
                </span>
                <span className="text-gray-700"> {list}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 4. Experience Section */}
      <Section title="Experience">
        {resumeData.workExperience.map((work) => (
          <div key={work.id} className="mb-3 break-inside-avoid">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800">
                {work.position}
              </h3>
              <span className="text-xs font-medium text-gray-600">
                {work.start_date} – {work.end_date}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-700">
              {work.company}
            </h4>
            <HtmlContent content={work.description} />
          </div>
        ))}
      </Section>

      {/* 5. Projects Section */}
      <Section title="Projects">
        {resumeData.projects.map((proj) => (
          <div key={proj.id} className="mb-3 break-inside-avoid">
            <h3 className="text-base font-semibold text-gray-800">
              {proj.title}
            </h3>
            <HtmlContent content={proj.description} />
          </div>
        ))}
      </Section>

      {/* 6. Activities Section */}
      <Section title="Activities">
        {resumeData.activitiesAndAchievements.map((activity) => (
          <div key={activity.id} className="mb-2 break-inside-avoid">
            <h3 className="text-base font-semibold text-gray-800">
              {activity.title}
            </h3>
            <HtmlContent content={activity.description} />
          </div>
        ))}
      </Section>
    </div>
  );
};

export default ResumeDisplay;