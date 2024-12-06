import React from "react";
import { formElementAtom } from "../atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
const FormPreview = () => {
  const formElements = useAtomValue(formElementAtom);
  const setFormElements = useSetAtom(formElementAtom);
  const deleteButtonClick = (id: string) => {
    const newFormElements = formElements.filter((element) => element.id !== id);
    setFormElements(newFormElements);
  };
  return (
    <Card className="w-full px-2 py-2 text-center">
      {formElements.length === 0 ? (
        <CardTitle className="text-2xl text-center font-bold">
          Form Preview
        </CardTitle>
      ) : (
        formElements.map((element) => {
          return (
            <div key={element.id} className="flex flex-col gap-3 justify-start">
              <Label className="text-xl font-semibold text-start">
                {element.label}
              </Label>
              <div className="flex gap-4">
                <Input
                  name={element.name}
                  type={element.type}
                  placeholder={element.placeholder}
                />
                <Button>Edit</Button>
                <Button onClick={() => deleteButtonClick(element.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })
      )}
    </Card>
  );
};

export default FormPreview;
