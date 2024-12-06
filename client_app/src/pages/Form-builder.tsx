import React from "react";
import FormPreview from "@/features/form-builder/components/FormPreview";
import FormCreator from "@/features/form-builder/components/FormCreator";
const FormBuilder = () => {
  return (
    <main className="flex justify-between items-center h-screen px-4 gap-3">
      <FormPreview />
      <FormCreator />
    </main>
  );
};

export default FormBuilder;
