import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import FormBuilder from "./pages/Form-builder";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form_builder" element={<FormBuilder />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
