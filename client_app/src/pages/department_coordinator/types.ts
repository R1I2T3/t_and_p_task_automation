export type SemesterPerformance = {
  semester: string;
  performance: number;
};

export type SemesterAttendance = {
  semester: string;
  attendance: number;
};

export type TrainingPerformance = {
  semester: string;
  training_performance: number;
  program: string;
};

export type TrainingAttendance = {
  semester: string;
  training_attendance: number;
  program: string;
};

export type DeptStudentFormData = {
  uid: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  department: string;
  academic_year: string;
  current_category: string;
  is_student_coordinator: boolean;
  consent: string;
  batch: string;
  is_pli: boolean;

  academic_performance?: SemesterPerformance[];
  academic_attendance?: SemesterAttendance[];
  training_performance?: TrainingPerformance[];
  training_attendance?: TrainingAttendance[];
};
