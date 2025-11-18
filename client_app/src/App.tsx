import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Home from "./pages/home";
import { getCookie } from "./utils";
import { authAtom } from "./authAtom";
import { useSetAtom } from "jotai";
import CreateNotification from "./pages/notification/create-notification";
import NotificationDetail from "./pages/notification/notification-detail";
import NotificationList from "./pages/notification/notification-list";
import NotificationParent from "./pages/notification/notification-parent";
import ProgramCoordinatorLayout from "./pages/program_coordinator/layout";
import ProgramHome from "./pages/program_coordinator";
import Update from "./pages/program_coordinator/Update";
import Session from "./pages/program_coordinator/Session";
import Upload from "./pages/program_coordinator/Upload";
import Attendance from "./pages/program_coordinator/Attendance";
import StudentLayout from "./pages/student/student_layout";
import SessionAttendance from "./pages/student/SessionAttendance";
import StudentPersonalInfo from "./pages/student/student-personal-info";
import PlacementRegistration from "./pages/student/PlacementRegistration";
import InternshipRegistration from "./pages/student/InternshipRegistration";
import StudentInternships from "./pages/student/InternshipSummary";
import Resume from "./pages/student/resume";
import ResumePreview from "./pages/student/resume-preview";
import FacultyLayout from "./pages/faculty_coordinator/FacultyLayout";
import FacultyHome from "./pages/faculty_coordinator/FacultyHome";
import FacultyTablePage from "./pages/faculty_coordinator/FacultyAttendanceTable";
import DepartmentParent from "./pages/department_coordinator/DepartmentParent";
import DepartmentStudentData from "./pages/department_coordinator/DepartmentStudentData";
import DepartmentAttendance from "./pages/department_coordinator/DepartmentAttendance";
import UploadInhouseInternship from "./pages/department_coordinator/UploadInhouseInternship";
import PlacementLayout from "./pages/placement_officer/PlacementLayout";
import { CategoryDataStatistics } from "./pages/placement_officer/CategoryData";
import { PlacementDashboard } from "./pages/placement_officer";
import Old from "./pages/placement_officer/Old";
import TrainingLayout from "./pages/training_officer/TrainingLayout";
import TrainingStats from "./pages/training_officer/TrainingStats";
import TrainingNotice from "./pages/training_officer/TrainingNotice";
import InternshipLayout from "./pages/internship_officer/InternshipLayout";
import InternShipNotice from "./pages/internship_officer/InternShipNotice";
import InternshipCompanyRegister from "./pages/internship_officer/InternshipCompanyRegister";
import InternShipVerify from "./pages/internship_officer/InternShipVerify";
// import InternshipReport from "./pages/internship_officer/internship_report";
import InternshipStats from "./pages/internship_officer/Stats";
import OnePageReport from "./pages/internship_officer/OnePageReport";
import PrincipalLayout from "./pages/principal/PrincipalLayout";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffNotice from "./pages/staff/StaffNotice";
import CategoryRuleForm from "./pages/placement_officer/CategoryRuleForm";
import CategoryRuleList from "./pages/placement_officer/CategoryRuleList";
import StudentByCategory from "./pages/placement_officer/StudentByCategory";
import PlacementCompany from "./pages/staff/placement_company";
import CompanyPage from "./pages/staff/placement_companies_view";
import ViewCompanyInfo from "./pages/staff/view-company-info";
import EditCompanyInfo from "./pages/staff/edit-comapny-info";
import StudentManager from "./pages/staff/student-management";
import { QueryClientProvider } from "@tanstack/react-query";
import { SERVER_URL } from "./constant";
import SendPlacementMessage from "./pages/staff/SendPlacementMessage";
import PlacementCard from "./pages/student/placement-card";
import { ConsolidationReportPage } from "./pages/placement_officer/ConsolidatedReport";
import { BranchWiseReport } from "./pages/placement_officer/BranchWiseReport";
import TrainingPerformanceUpload from "./pages/program_coordinator/TrainingPerformanceUpload";
import StudentTrainingPerformance from "./pages/student/StudentTrainingPerformance";

import { StudentStatusReport } from "./pages/placement_officer/StudentPerformance";
import DepartmentDashboard from "./pages/department_coordinator/DepartmentStats";

const App = () => {
  const setUser = useSetAtom(authAtom);
  useEffect(() => {
    const onAuthenticate = async () => {
      const res = await fetch("/api/", {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCookie("csrftoken") || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setUser(data);
      } else {
        window.open(`${SERVER_URL}/auth/login/`, "_self");
      }
    };
    onAuthenticate();
  }, []);
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<NotificationParent />}>
            <Route index element={<NotificationList />} />
            <Route path="create" element={<CreateNotification />} />
            <Route path=":id" element={<NotificationDetail />} />
          </Route>
          <Route
            path="/program_coordinator"
            element={<ProgramCoordinatorLayout />}
          >
            <Route path="session-creation" element={<Session />} />
            <Route path="attendance-and-marks" element={<Attendance />} />
            <Route path="update-attendance" element={<Update />} />
            <Route path="upload-file" element={<Upload />} />
            <Route index element={<ProgramHome />} />
            <Route
              path="performance-upload"
              element={<TrainingPerformanceUpload />}
            />
          </Route>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="session-attendance" element={<SessionAttendance />} />
            <Route
              path="training-performance"
              element={<StudentTrainingPerformance />}
            />
            <Route index element={<StudentPersonalInfo />} />
            <Route path="resume" element={<Resume />} />
            <Route path="resume-preview" element={<ResumePreview />} />
            <Route
              path="placement/registration/:id"
              element={<PlacementRegistration />}
            />
            <Route path="placement-card" element={<PlacementCard />} />
            <Route
              path="internship/registration/:id"
              element={<InternshipRegistration />}
            />
            <Route path="internships" element={<StudentInternships />} />
          </Route>
          <Route path="/faculty_coordinator" element={<FacultyLayout />}>
            <Route index element={<FacultyHome />} />
            <Route path="attendance" element={<FacultyTablePage />} />
          </Route>
          <Route path="/department_coordinator" element={<DepartmentParent />}>
            <Route path="attendance" element={<DepartmentAttendance />} />
            <Route path="" element={<DepartmentStudentData />} />
            <Route
              path="upload-inhouse-internship"
              element={<UploadInhouseInternship />}
            />
            <Route path="department_stats" element={<DepartmentDashboard />} />
          </Route>
          <Route path="/placement_officer" element={<PlacementLayout />}>
            <Route index element={<PlacementDashboard />} />
            <Route path="branch-wise-report" element={<BranchWiseReport />} />
            <Route
              path="student-performance"
              element={<StudentStatusReport />}
            />
            <Route
              path="placement-consolidated-report"
              element={<ConsolidationReportPage />}
            />
            <Route
              path="comparative_Placement_Statistics"
              element={
                <div>
                  <CategoryDataStatistics />
                </div>
              }
            />
            <Route path="placement_old" element={<Old />} />
          </Route>
          <Route path="/training_officer" element={<TrainingLayout />}>
            <Route index element={<TrainingStats />} />
            <Route path="notice" element={<TrainingNotice />} />
          </Route>
          <Route path="/internship_officer" element={<InternshipLayout />}>
            <Route index element={<InternshipStats />} />
            <Route path="notice" element={<InternShipNotice />} />
            <Route
              path="company_register"
              element={<InternshipCompanyRegister />}
            />
            <Route path="verify" element={<InternShipVerify />} />
            <Route path="report" element={<OnePageReport />} />
          </Route>
          <Route path="/principal" element={<PrincipalLayout />}>
            <Route index element={<TrainingStats />} />
            <Route
              path="placement"
              element={
                <div>
                  <Old />
                </div>
              }
            />
            <Route path="internship" element={<InternshipStats />} />
          </Route>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffNotice />} />
            <Route path="placement_companies" element={<CompanyPage />} />
            <Route
              path="placement_companies/register"
              element={<PlacementCompany />}
            />
            <Route
              path="placement_companies/view"
              element={<ViewCompanyInfo />}
            />
            <Route
              path="placement_companies/message"
              element={<SendPlacementMessage />}
            />
            <Route
              path="placement_companies/edit"
              element={<EditCompanyInfo />}
            />
            <Route
              path="internship/register"
              element={<InternshipCompanyRegister />}
            />
            <Route path="student-management" element={<StudentManager />} />
            <Route path="internship/verify" element={<InternShipVerify />} />
          </Route>
          <Route path="/category-rule-form" element={<CategoryRuleForm />} />
          <Route path="/category-rules/list" element={<CategoryRuleList />} />
          <Route
            path="/category-rules/students/:category/:batch"
            element={<StudentByCategory />}
          />

          <Route
            path="/student/student-training-performance"
            element={<StudentTrainingPerformance />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
