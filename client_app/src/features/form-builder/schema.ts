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

export type formCreationType = z.infer<typeof formCreationSchema>;
