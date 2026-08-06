import { z } from "zod";

export const COURSE_INTEREST_OPTIONS = [
  "AI Tools Mastery",
  "Future Courses",
  "Corporate Training",
  "Other",
] as const;

export const contactFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().refine((s) => {
    const t = s.trim();
    return t === "" || /^[\d\s\-+().]{7,}$/.test(t);
  }, "Enter a valid phone number or leave blank"),
  courseInterest: z.enum(COURSE_INTEREST_OPTIONS),
  message: z.string().min(10, "Please enter at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
