import React from "react";
import FormPreview from "@/features/form-builder/components/FormPreview";
import FormCreator from "@/features/form-builder/components/FormCreator";
import NavBar from "@/components/NavBar";
const FormBuilder = () => {
  return (
    <>
      <NavBar />
      <main className="flex justify-between items-center h-[90dvh] px-4 gap-3">
        <FormCreator />
        <FormPreview />
      </main>
    </>
  );
};

export default FormBuilder;
