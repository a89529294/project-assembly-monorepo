import { z } from "zod";

export const companyInfoFormSchema = z.object({
  name: z.string().min(1, { message: "必填" }),
  phone: z.string().min(1, { message: "必填" }),
  email: z.string().min(1, { message: "必填" }),
  fax: z.string().min(1, { message: "必填" }),
  taxId: z.string().min(1, { message: "必填" }),
  county: z.string().min(1, { message: "必填" }),
  district: z.string().min(1, { message: "必填" }),
  address: z.string().min(1, { message: "必填" }),
  logoURL: z
    .union([
      z.custom<File>((file) => file instanceof File, {
        message: "Invalid file object",
      }),
      z.string(),
    ])
    .nullable(),
});

type A = z.infer<typeof companyInfoFormSchema>;
