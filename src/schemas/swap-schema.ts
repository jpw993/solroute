import { z } from 'zod';

export const SwapFormSchema = z.object({
  inputTokenId: z.string().min(1, "Input token is required."),
  outputTokenId: z.string().min(1, "Output token is required."),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
}).refine(data => data.inputTokenId !== data.outputTokenId, {
  message: "Input and output tokens cannot be the same.",
  path: ["outputTokenId"], // Optionally specify which field the error message is associated with
});

export type SwapFormValues = z.infer<typeof SwapFormSchema>;
