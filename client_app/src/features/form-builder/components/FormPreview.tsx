import React from "react";
import { editFormElementAtom, formElementAtom } from "../atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const FormPreview = () => {
  const formElements = useAtomValue(formElementAtom);
  const setFormElements = useSetAtom(formElementAtom);
  const setEditFormElement = useSetAtom(editFormElementAtom);
  const deleteButtonClick = (id: string) => {
    const newFormElements = formElements.filter((element) => element.id !== id);
    setFormElements(newFormElements);
  };
  const editButtonClick = (id: string) => {
    const editFormElement = formElements.find((element) => element.id === id);
    if (editFormElement) {
      setEditFormElement(editFormElement);
    }
  };
  return formElements.length === 0 ? null : (
    <Card className="w-full px-2 py-2 text-center max-h-[70dvh] overflow-y-auto">
      <CardTitle className="text-2xl text-center font-bold my-3 text-[#d17a00]">
        Form Preview
      </CardTitle>
      <CardContent>
        {formElements.map((element) => (
          <div key={element.id} className="flex flex-col gap-3 justify-start">
            <Label className="text-xl font-semibold text-start">
              {element.label}
            </Label>
            <div className="flex gap-4 justify-between">
              {element.type !== "select" &&
                element.type !== "radio" &&
                element.type !== "checkbox" && (
                  <Input
                    name={element.name}
                    type={element.type}
                    placeholder={element.placeholder}
                  />
                )}
              {element.type === "select" && (
                <Select name={element.name}>
                  <SelectTrigger>
                    <SelectValue placeholder={"select a item"} />
                  </SelectTrigger>
                  <SelectContent>
                    {element.options?.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex flex-wrap gap-2">
                {element.type === "radio" &&
                  element.options &&
                  element.options.length > 0 && (
                    <RadioGroup
                      name={element.name}
                      defaultValue={element.options[0].value}
                      className="flex flex-row gap-2"
                    >
                      {element.options.map((option, index) => (
                        <div
                          className="flex items-center space-x-2"
                          key={index}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label htmlFor={option.value}>{option.value}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                {element.type === "checkbox" &&
                  element.options &&
                  element.options.length > 0 &&
                  element.options.map((option, index) => (
                    <div className="flex items-center space-x-2" key={index}>
                      <Checkbox value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.value}</Label>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => editButtonClick(element.id)}
                  className="bg-[#d17a00] hover:bg-[#d17a00]/70"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteButtonClick(element.id)}
                  className="bg-[#d17a00] hover:bg-[#d17a00]/70"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
export default FormPreview;
