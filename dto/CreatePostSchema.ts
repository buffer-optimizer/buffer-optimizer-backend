import { z } from 'zod';

const CreatePostSchema = z.object({
    text: z.string().min(1).max(280),
    now: z.boolean().optional(),
    scheduled_at: z.string().optional(),
    media: z.array(z.object({
        type: z.enum(['image', 'video', 'gif']),
        url: z.string().url(),
        alt_text: z.string().optional()
    })).optional(),
    shorten: z.boolean().optional(),
    attachment: z.boolean().optional()
});

export default CreatePostSchema;