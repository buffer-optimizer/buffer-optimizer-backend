import { z } from 'zod';
import {AnalyticsOptions, SocialPlatform} from "../utils/buffer-sdk";

// Schema for parsing URL query parameters (all optional since they come from URL)
export const AnalyticsQuerySchema = z.object({
    timeRange: z.enum(['7d', '30d', '90d', '1y', 'custom']).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    period: z.string().optional(), // Keep as string since it comes from URL
    platforms: z.string().transform(val => val.split(',')).optional(), // "twitter,linkedin" -> ["twitter", "linkedin"]
    includeMetrics: z.string().transform(val => val.split(',')).optional(),
    groupBy: z.enum(['day', 'week', 'month']).optional(),
}).strict(); // Reject unknown query parameters

// Type for the parsed query
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

// Helper function to convert query params to AnalyticsOptions
export function queryToAnalyticsOptions(query: AnalyticsQuery): Partial<AnalyticsOptions> {
    const options: Partial<AnalyticsOptions> = {};

    // Handle timeRange
    if (query.timeRange) {
        options.timeRange = query.timeRange;
    }

    // Handle explicit dates
    if (query.start) {
        options.start = query.start;
    }
    if (query.end) {
        options.end = query.end;
    }

    // Handle period
    if (query.period) {
        options.period = query.period;
    }

    // Handle arrays
    if (query.platforms) {
        options.platforms = query.platforms as SocialPlatform[];
    }
    if (query.includeMetrics) {
        options.includeMetrics = query.includeMetrics as Array<'likes' | 'comments' | 'shares' | 'clicks' | 'reach' | 'impressions'>;
    }

    // Handle groupBy
    if (query.groupBy) {
        options.groupBy = query.groupBy;
    }

    return options;
}