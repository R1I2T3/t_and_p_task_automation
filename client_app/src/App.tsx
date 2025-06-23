import { BrowserRouter, Route, Routes } from "react-router";
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
import StudentHome from "./pages/student";
import SessionAttendance from "./pages/student/SessionAttendance";
import ConsentForm from "./pages/student/ConsentForm";
import PliForm from "./pages/student/PliForm";
import InternShipSubmission from "./pages/student/InternShipSubmission";
import StudentPersonalInfo from "./pages/student/student-personal-info";
import PlacementRegistration from "./pages/student/PlacementRegistration";
import InternshipRegistration from "./pages/student/InternshipRegistration";
import Resume from "./pages/student/resume";
import ResumePreview from "./pages/student/resume-preview";
import FacultyLayout from "./pages/faculty_coordinator/FacultyLayout";
import FacultyHome from "./pages/faculty_coordinator/FacultyHome";
import FacultyTablePage from "./pages/faculty_coordinator/FacultyAttendanceTable";
import DepartmentParent from "./pages/department_coordinator/DepartmentParent";
import DepartmentDashboard from "./pages/department_coordinator/DepartmentHome";
import DepartmentStats from "./pages/department_coordinator/DepartmentStats";
import DepartmentAttendance from "./pages/department_coordinator/DepartmentAttendance";
import PlacementLayout from "./pages/placement_officer/PlacementLayout";
import CompanyRegistrationForm from "./pages/placement_officer/CompanyRegisteration";
import NoticeCreationForm from "./pages/placement_officer/NoticeCreation";
import PlacementReport from "./pages/placement_officer/PlacementReport";
import { CategoryDataStatistics } from "./pages/placement_officer/CategoryData";
import { ComparativePlacementStatistics } from "./pages/placement_officer/ComparitivePlacementStatistic";
import PlacementStats from "./pages/placement_officer";
import Old from "./pages/placement_officer/Old";
import JobVerification from "./pages/placement_officer/components/JobVerification";
import PlacementAttendance from "./pages/placement_officer/PlacementAttendance";
import TrainingLayout from "./pages/training_officer/TrainingLayout";
import TrainingStats from "./pages/training_officer/TrainingStats";
import TrainingNotice from "./pages/training_officer/TrainingNotice";
import InternshipLayout from "./pages/internship_officer/InternshipLayout";
import InternShipNotice from "./pages/internship_officer/InternShipNotice";
import InternshipCompanyRegister from "./pages/internship_officer/InternshipCompanyRegister";
import InternShipVerify from "./pages/internship_officer/InternShipVerify";
import InternshipReport from "./pages/internship_officer/internship_report";
import InternshipStats from "./pages/internship_officer/Stats";
import OnePageReport from "./pages/internship_officer/OnePageReport";
import JobAcceptance from "./pages/student/JobAcceptance";
import PrincipalLayout from "./pages/principal/PrincipalLayout";
import StaffLayout from "./pages/staff/StaffLayout";
import StaffNotice from "./pages/staff/StaffNotice";
import CreateResource from "./pages/resources/create-resource";
import ResourceList from "./pages/resources/resource-list";
import ResourceDetail from "./pages/resources/resource-details";
import PlacementSummary from "./pages/student/PlacementSummary";
import UploadInhouseInternship from "./pages/department_coordinator/UploadInhouseInternship";
import CategoryRuleForm from "./pages/placement_officer/CategoryRuleForm";
import CategoryRuleList from "./pages/placement_officer/CategoryRuleList";
import StudentByCategory from "./pages/placement_officer/StudentByCategory";
import DepartmentStudentData from "./pages/department_coordinator/DepartmentStudentData";

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
        window.open("http://localhost:8000/auth/login", "_self");
      }
    };
    onAuthenticate();
  }, []);
  return (
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
        </Route>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentHome />} />
          <Route path="consent/:id" element={<ConsentForm />} />
          <Route path="pli/:id" element={<PliForm />} />
          <Route path="session-attendance" element={<SessionAttendance />} />
          <Route path="info" element={<StudentPersonalInfo />} />
          <Route path="resume" element={<Resume />} />
          <Route path="resume-preview" element={<ResumePreview />} />
          <Route path="job-acceptance" element={<JobAcceptance />} />
          <Route path="placement-summary" element={<PlacementSummary />} />
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/:id" element={<ResourceDetail />} />

          <Route
            path="placement/registration/:id"
            element={<PlacementRegistration />}
          />
          <Route
            path="internship/registration/:id"
            element={<InternshipRegistration />}
          />
          <Route
            path="internship-submission"
            element={<InternShipSubmission />}
          />
        </Route>
        <Route path="/faculty_coordinator" element={<FacultyLayout />}>
          <Route index element={<FacultyHome />} />
          <Route path="attendance" element={<FacultyTablePage />} />
          <Route path="resource/create" element={<CreateResource />} />
        </Route>
        <Route path="/department_coordinator" element={<DepartmentParent />}>
          <Route index element={<DepartmentDashboard />} />
          <Route path="student-data" element={<DepartmentStudentData />} />
          <Route path="stats" element={<DepartmentStats />} />
          <Route path="attendance" element={<DepartmentAttendance />} />
          <Route path="upload-inhouse-internship" element={<UploadInhouseInternship />} />
        </Route>
        <Route path="/placement_officer" element={<PlacementLayout />}>
          <Route index element={<PlacementStats />} />
          <Route
            path="company_register"
            element={<CompanyRegistrationForm />}
          />
          <Route path="verify" element={<JobVerification />} />
          <Route path="create_notice" element={<NoticeCreationForm />} />
          <Route path="report" element={<PlacementReport />} />
          <Route path="attendance" element={<PlacementAttendance />} />
          <Route
            path="comparative_Placement_Statistics"
            element={
              <div>
                <CategoryDataStatistics />
                <ComparativePlacementStatistics />
              </div>
            }
          />
          <Route path="/placement_officer/2024" element={<Old />} />
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
          <Route path="internship-reports" element={<InternshipReport />} />
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
          <Route
            path="placement/register"
            element={<CompanyRegistrationForm />}
          />
          <Route path="placement/verify" element={<JobVerification />} />
          <Route
            path="internship/register"
            element={<InternshipCompanyRegister />}
          />
          <Route path="internship/verify" element={<InternShipVerify />} />
        </Route>
        <Route path="/category-rule-form" element={<CategoryRuleForm />} />
        <Route path="/category-rules/list" element={<CategoryRuleList />} />
        <Route path="/category-rules/students/:category/:batch" element={<StudentByCategory />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;