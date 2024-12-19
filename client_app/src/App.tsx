import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import FormBuilder from "./pages/Form-builder";
import Form from "./pages/form";
import CreatePlacementNotice from "./pages/placement/create-notice";
import Notice from "./pages/placement/notice";
import PlacementJobApplications from "./pages/placement/placement_job_application";
import StudentJobApplication from "./pages/placement/student_job_application";
import CompanyJobApplications from "./pages/placement/company_job_applications";
import CompanyJobAcceptance from "./pages/placement/company_job_acceptance";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form_builder" element={<FormBuilder />} />
        <Route path="/form/:id" element={<Form />} />
        <Route
          path="/placement/create_notice/:id"
          element={<CreatePlacementNotice />}
        />
        <Route path="/placement/notice/:id" element={<Notice />} />
        <Route
          path="/placement/job/:id"
          element={<PlacementJobApplications />}
        />
        <Route
          path="/job/application/student/:uid"
          element={<StudentJobApplication />}
        />
        <Route
          path="/job/application/company/:id"
          element={<CompanyJobApplications />}
        />
        <Route path="/job/acceptance" element={<CompanyJobAcceptance />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
