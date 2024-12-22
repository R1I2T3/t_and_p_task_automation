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
        </Route>
        <Route path="/notifications" element={<NotificationParent />}>
          <Route index element={<NotificationList />} />
          <Route path="create" element={<CreateNotification />} />
          <Route path=":id" element={<NotificationDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
