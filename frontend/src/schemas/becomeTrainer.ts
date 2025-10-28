import z from "zod";

export const becomeTrainerSchema = (
    reasonErrorShort: string,
    reasonErrorLong: string,
) => z.object({
    reason: z.string().min(10, reasonErrorShort).max(1000, reasonErrorLong),
})

export type BecomeTrainerFormValues = z.infer<ReturnType<typeof becomeTrainerSchema>>;