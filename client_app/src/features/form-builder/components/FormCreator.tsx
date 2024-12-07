import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { formCreationSchema, formCreationType } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/Input";
import SelectFormControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import { formElementAtom, editFormElementAtom } from "../atoms";
import Options from "./Options";

const FormCreator = () => {
  const [formElements, setFormElements] = useAtom(formElementAtom);
  const editFormElementValue = useAtomValue(editFormElementAtom);
  const setEditFormElement = useSetAtom(editFormElementAtom);
  const form = useForm<formCreationType>({
    resolver: zodResolver(formCreationSchema),
    defaultValues: {
      name: "",
      label: "",
      placeholder: "",
      type: "",
      options: [{ value: "" }],
    },
  });
  useEffect(() => {
    if (editFormElementValue) {
      form.reset({
        name: editFormElementValue.name,
        label: editFormElementValue.label,
        placeholder: editFormElementValue.placeholder,
        type: editFormElementValue.type,
        options: editFormElementValue.options || [{ value: "" }],
      });
    }
  }, [editFormElementValue]);

  const options = ["text", "number", "file", "select", "radio", "checkbox"];
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  console.log(selectedType);

  const onFormSubmit = (values: formCreationType) => {
    if (!editFormElementValue) {
      const allFormElements = [
        ...formElements,
        {
          name: values.name,
          type: values.type,
          id: crypto.randomUUID(),
          placeholder: values.placeholder,
          label: values.label,
          options: values.options,
        },
      ];
      setFormElements(allFormElements);
    }
    if (editFormElementValue) {
      const updatedFormElements = formElements.map((element) => {
        if (element.id === editFormElementValue.id) {
          return {
            name: values.name,
            type: values.type,
            id: editFormElementValue.id,
            placeholder: values.placeholder,
            label: values.label,
            options: values.options,
          };
        }
        return element;
      });
      setFormElements(updatedFormElements);
      setEditFormElement(null);
    }
    form.reset({
      name: "",
      label: "",
      placeholder: "",
      type: "",
      options: [{ value: "" }],
    });
  };

  return (
    <Card className="w-full max-w-[50dvw]  overflow-y-auto mx-auto py-3">
      <CardTitle className="text-2xl text-center font-bold my-2 text-[#d17a00]">
        Form Creator
      </CardTitle>
      <CardContent>
        <Form {...form}>
          <form
            className="flex gap-3 flex-col"
            onSubmit={form.handleSubmit(onFormSubmit)}
          >
            <FormProvider {...form}>
              <Input label="Field Name" name="name" />
              <Input label="Field label" name="label" />
              <Input label="Field placeholder" name="placeholder" />
              <SelectFormControl
                name="type"
                placeholder="Field Type"
                label="Field Type"
                options={options}
              />
              {(selectedType === "checkbox" ||
                selectedType === "select" ||
                selectedType === "radio") && <Options />}
              <Button
                className="py-2 rounded-md bg-[#d17a00] hover:bg-[#d17a00]/80 text-xl font-bold"
                type="submit"
              >
                {editFormElementValue ? "Update" : "Add"}
              </Button>
            </FormProvider>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FormCreator;
