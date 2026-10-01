import * as z from "zod";

export const generalSettingsSchema = z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters").max(50, "Name is too long"),
    imageUrl: z.string().url("Please upload a valid image").optional().or(z.literal("")),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;