import React, { useEffect, useState, useTransition } from "react";
import NavBar from "@/components/NavBar";
import { useParams } from "react-router";
import { FormSchema, FormType } from "@/features/form-builder/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

const Form = () => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { id } = useParams();

  // Fetch form data
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/form/get/${id}`);
      if (res.status !== 200) {
        console.error("Error in fetching form");
      }
      const data = await res.json();
      try {
        const validatedData = FormSchema.parse(data);
        setForm(validatedData);

        // Initialize formData with default values or empty strings
        const initialData: Record<string, any> = {};
        // validatedData.formfields.forEach((field) => {
        //   if (field.field_type === "checkbox") {
        //     initialData[field.field_name] = []; // Multiple values
        //   } else if (field.field_type === "radio" && field.options.) {
        //     initialData[field.field_name] = field.options[0]?.value || "";
        //   } else if (field.field_type === "select" && field.options[0].value!=="") {
        //     initialData[field.field_name] = field.options[0]?.value || "";
        //   } else {
        //     initialData[field.field_name] = ""; // Empty string for others
        //   }
        // });
        setFormData(initialData);
      } catch (error) {
        console.error(error);
      }
    };

    startTransition(() => {
      fetchData();
    });
  }, [id, startTransition]);

  if (pending) {
    return (
      <h1 className="w-full h-screen flex justify-center items-center">
        Fetching form...
      </h1>
    );
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => {
      if (type === "checkbox") {
        const updatedValues = checked
          ? [...(prevData[name] || []), value]
          : prevData[name].filter((val: string) => val !== value);
        return { ...prevData, [name]: updatedValues };
      }

      if (type === "file" && files) {
        return { ...prevData, [name]: files[0] }; // Only take the first file
      }

      return { ...prevData, [name]: value };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value instanceof File ? value.name : value);
    });

    // fetch(`/api/form/submit/${id}`, {
    //   method: "POST",
    //   body: formPayload,
    // })
    //   .then((res) => res.json())
    //   .then((data) => console.log("Submission successful:", data))
    //   .catch((err) => console.error("Submission error:", err));
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <NavBar />
      <main className="flex flex-grow justify-center items-center">
        <Card className="w-[90%] md:w-[50%] lg:w-[34%]">
          <CardTitle className="text-2xl text-center font-bold my-3 text-[#d17a00]">
            {form?.purpose} Form
          </CardTitle>
          <CardContent className="w-full">
            <form onSubmit={handleSubmit}>
              {form &&
                form.formfields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-3">
                    <Label className="text-xl font-semibold text-start">
                      {field.field_label}
                    </Label>
                    <div className="flex gap-4 justify-between">
                      {["text", "number", "file"].includes(
                        field.field_type
                      ) && (
                        <Input
                          name={field.field_name}
                          type={field.field_type}
                          placeholder={field.field_placeholder}
                          value={
                            field.field_type !== "file"
                              ? formData[field.field_name] || ""
                              : undefined
                          }
                          onChange={handleInputChange}
                        />
                      )}

                      {/* Select Input */}
                      {field.field_type === "select" && (
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange(field.field_name, value)
                          }
                          value={formData[field.field_name] || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem value={option.value} key={option.id}>
                                {option.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Radio Group */}
                      {field.field_type === "radio" &&
                        field.options &&
                        field.options.length > 0 && (
                          <RadioGroup
                            name={field.field_name}
                            value={formData[field.field_name] || ""}
                            onValueChange={(value) =>
                              handleSelectChange(field.field_name, value)
                            }
                            className="flex flex-row gap-2"
                          >
                            {field.options.map((option) => (
                              <div
                                className="flex items-center space-x-2"
                                key={option.id}
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                />
                                <Label htmlFor={option.value}>
                                  {option.value}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                      {/* Checkbox Group */}
                      {field.field_type === "checkbox" &&
                        field.options &&
                        field.options.length > 0 &&
                        field.options.map((option) => (
                          <div
                            className="flex items-center space-x-2"
                            key={option.id}
                          >
                            <Checkbox
                              name={field.field_name}
                              value={option.value}
                              id={option.value}
                              checked={
                                formData[field.field_name]?.includes(
                                  option.value
                                ) || false
                              }
                              onChange={handleInputChange}
                            />
                            <Label htmlFor={option.value}>{option.value}</Label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              <Button
                className="py-2 rounded-md bg-[#d17a00] hover:bg-[#d17a00]/80 text-xl font-bold w-full mt-5"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Form;
