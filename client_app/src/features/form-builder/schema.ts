import { z } from "zod";

export const formCreationSchema = z.object({
  name: z.string().min(1, { message: "Field name is required" }),
  label: z.string().min(1, { message: "Field label is required" }),
  placeholder: z.string(),
  type: z.string(),
  options: z
    .array(
      z.object({
        value: z.string(),
      })
    )
    .optional(),
});

const OptionSchema = z.object({
  id: z.string().uuid(),
  value: z.string(), // Since the value is a JSON string, you can parse it later if needed
});

const FormFieldSchema = z.object({
  id: z.string().uuid(),
  field_name: z.string(),
  field_label: z.string(),
  field_placeholder: z.string(),
  field_type: z.enum([
    "select",
    "text",
    "radio",
    "checkbox",
    "text",
    "file",
    "number",
  ]), // Add other field types as needed
  options: z.array(OptionSchema).optional(), // Optional because not all fields may have options
});

export const FormSchema = z.object({
  id: z.string().uuid(),
  purpose: z.string(),
  last_date: z.string().datetime(), // ISO 8601 date-time string
  created_at: z.string().datetime(), // ISO 8601 date-time string
  formfields: z.array(FormFieldSchema),
});
export type formCreationType = z.infer<typeof formCreationSchema>;
export type FormType = z.infer<typeof FormSchema>;
