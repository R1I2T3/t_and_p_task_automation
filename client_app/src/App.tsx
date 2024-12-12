import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import FormBuilder from "./pages/Form-builder";
import Form from "./pages/form";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form_builder" element={<FormBuilder />} />
        <Route path="/form/:id" element={<Form />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
