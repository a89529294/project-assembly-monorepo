import { z } from "zod";

export const companyInfoFormSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1),
  fax: z.string().min(1),
  taxId: z.string().min(1),
  county: z.string().min(1),
  district: z.string().min(1),
  address: z.string().min(1),
  logoURL: z.string().min(1).optional(),
});
