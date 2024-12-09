import React from "react";
import FormPreview from "@/features/form-builder/components/FormPreview";
import FormCreator from "@/features/form-builder/components/FormCreator";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { formElementAtom } from "@/features/form-builder/atoms";
const FormBuilder = () => {
  const formElement = useAtomValue(formElementAtom);
  const onClick = async () => {
    const res = await fetch("/api/form/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form: {
          purpose: "consent",
          last_date: new Date(),
        },
        fields: formElement,
      }),
    });
    if (res.status !== 201) {
      console.log("Error in creating form");
    }
    const data = await res.json();
    console.log(data);
  };
  return (
    <>
      <NavBar />
      <main className="flex justify-between items-center h-[90dvh] px-4 gap-3">
        <FormCreator />
        <FormPreview />
        <Button onClick={onClick}>Send Form</Button>
      </main>
    </>
  );
};

export default FormBuilder;
