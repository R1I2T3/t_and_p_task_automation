import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";

const Options = () => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
    rules: { minLength: 1 },
  });
  console.log(fields);

  return (
    <div className="flex flex-col gap-1">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex  w-full justify-start items-center gap-1"
        >
          <Controller
            name={`options.${index}.value`}
            control={form.control}
            render={({ field: { value, onChange } }) => (
              <Input placeholder="name" value={value} onChange={onChange} />
            )}
          />
          <Button onClick={() => append({ value: "" })} type="button">
            Add
          </Button>
          {index !== 0 && (
            <Button onClick={() => remove(index)} type="button">
              Remove
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Options;
