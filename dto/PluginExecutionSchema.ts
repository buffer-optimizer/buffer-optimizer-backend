import { z } from 'zod';

const PluginExecutionSchema = z.object({
    profileId: z.string().optional(),
    timeRange: z.object({
        start: z.string(),
        end: z.string(),
        period: z.enum(['week', 'month', 'quarter', 'year']),
    }).optional(),
    config: z.record(z.string(), z.unknown()).default({})
});

export default PluginExecutionSchema;