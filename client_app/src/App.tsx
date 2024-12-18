import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import FormBuilder from "./pages/Form-builder";
import Form from "./pages/form";
import CreatePlacementNotice from "./pages/placement/create-notice";
import Notice from "./pages/placement/notice";
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
