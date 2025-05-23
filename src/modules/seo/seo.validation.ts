import { z } from 'zod';

export const seoCreationRequest = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(3, 'Title must be longer than 3 characters'),
  type: z.string().min(3, 'String must be longer than 3 characters'),
  description: z
    .string()
    .min(10, 'Description is must be longer than 10 characters')
    .optional(),
  keywords: z.array(z.string().min(1, 'Keyword is required')).optional(),
});

export const pdfGenerationRequest = z.object({
  params: z.object({
    id: z.string().min(20, 'Invalid ID'),
  }),
});
export const rerunSeoRequest = z.object({
  params: z.object({
    id: z.string().min(20, 'Invalid ID'),
  }),
});
// export const runAuditRequest = z.object({
//   params: z.object({
//     projectId: z.string().min(20, 'Invalid ID'),
//   }),
// });
