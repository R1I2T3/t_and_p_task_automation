import { BrowserRouter, Route, Routes } from "react-router";
import { useEffect } from "react";
import Home from "./pages/home";
import CreatePlacementNotice from "./pages/placement/create-notice";
import Notice from "./pages/placement/notice";
import PlacementJobApplications from "./pages/placement/placement_job_application";
import StudentJobApplication from "./pages/placement/student_job_application";
import CompanyJobApplications from "./pages/placement/company_job_applications";
import CompanyJobAcceptance from "./pages/placement/company_job_acceptance";
import CompanyRegistrationForm from "./pages/placement/companyRegistration";
import PlacementParent from "./pages/placement/components/PlacementParent";
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
import StudentPersonalInfo from "./pages/student/student-personal-info";
import Resume from "./pages/student/resume";
import ResumePreview from "./pages/student/resume-preview";
import PlacementAttendance from "./pages/placement/placement_attendance";
import FacultyLayout from "./pages/faculty_coordinator/FacultyLayout";
import FacultyHome from "./pages/faculty_coordinator/FacultyHome";
import DepartmentParent from "./pages/department_coordinator/DepartmentParent";
import DepartmentDashboard from "./pages/department_coordinator/DepartmentHome";
import DepartmentStats from "./pages/department_coordinator/DepartmentStats";
import DepartmentAttendance from "./pages/department_coordinator/DepartmentAttendance";
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
        <Route path="/placement" element={<PlacementParent />}>
          <Route path="create_notice/:id" element={<CreatePlacementNotice />} />
          <Route path="notice/:id" element={<Notice />} />
          <Route path="job/:id" element={<PlacementJobApplications />} />
          <Route
            path="job/application/student/:uid"
            element={<StudentJobApplication />}
          />
          <Route
            path="job/application/:id"
            element={<CompanyJobApplications />}
          />
          <Route path="job/acceptance" element={<CompanyJobAcceptance />} />
          <Route
            path="company/register"
            element={<CompanyRegistrationForm />}
          />
          <Route path="attendance" element={<PlacementAttendance />} />
        </Route>
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
          <Route path="info" element={<StudentPersonalInfo />} />
          <Route path="resume" element={<Resume />} />
          <Route path="resume-preview" element={<ResumePreview />} />
        </Route>
        <Route path="/faculty_coordinator" element={<FacultyLayout />}>
          <Route index element={<FacultyHome />} />
        </Route>
        <Route path="/department_coordinator" element={<DepartmentParent />}>
          <Route index element={<DepartmentDashboard />} />
          <Route path="stats" element={<DepartmentStats />} />
          <Route path="attendance" element={<DepartmentAttendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
