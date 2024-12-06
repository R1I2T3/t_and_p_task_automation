import { useAtom } from "jotai";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { formCreationSchema, formCreationType } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/Input";
import SelectFormControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import { formElementAtom } from "../atoms";
const FormCreator = () => {
  const [formElements, setFormElements] = useAtom(formElementAtom);
  const form = useForm<formCreationType>({
    resolver: zodResolver(formCreationSchema),
    defaultValues: {
      name: "",
      label: "",
      placeholder: "",
      type: "",
    },
  });

  const options = ["text", "number", "file", "select"];
  const onFormSubmit = (values: formCreationType) => {
    const allFormElements = [
      ...formElements,
      {
        name: values.name,
        type: values.type,
        id: crypto.randomUUID(),
        placeholder: values.placeholder,
        label: values.label,
      },
    ];
    setFormElements(allFormElements);
  };
  return (
    <Card className="w-full">
      <CardTitle className="text-2xl text-center font-bold">
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
              <Button className="py-1 rounded-md" type="submit">
                Add Element
              </Button>
            </FormProvider>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FormCreator;
