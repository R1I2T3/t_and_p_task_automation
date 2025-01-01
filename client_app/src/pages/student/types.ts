export interface Education {
  id: string;
  institution: string;
  degree: string;
  start_date: string;
  end_date: string;
  percentage: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ResumeData {
  id: string;
  name: string;
  email: string;
  phone_no: string;
  education: Education[];
  projects: Project[];
  workExperience: WorkExperience[];
  contacts: string[];
  skills: string[];
}
