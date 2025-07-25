import {
    Plugin,
    PluginExecutionContext,
    OptimalTimingAnalysis,
    TimeSlotRecommendation,
    PostAnalytics,
} from '../utils/buffer-sdk';

export class OptimalTimingPlugin implements Plugin {
    id = 'optimal-timing';
    name = 'Optimal Timing Analyzer';
    version = '1.0.0';
    description = 'Analyzes historical post performance to recommend optimal posting times';
    author = 'Buffer Optimizer Team';
    category = 'optimization' as const;
    enabled = true;

    config = {
        requiresAuth: true,
        configSchema: {
            minSampleSize: {
                type: 'number' as const,
                label: 'Minimum Sample Size',
                description: 'Minimum number of posts required for analysis',
                required: true,
            },
            confidenceThreshold: {
                type: 'number' as const,
                label: 'Confidence Threshold',
                description: 'Minimum confidence score for recommendations',
                required: true,
            },
        },
        defaultConfig: {
            minSampleSize: 10,
            confidenceThreshold: 0.7,
        },
    };

    async initialize(context: PluginExecutionContext): Promise<void> {
        // Validation and setup logic
        if (!context.profileId) {
            throw new Error('Profile ID is required for optimal timing analysis');
        }
    }

    async execute(context: PluginExecutionContext): Promise<OptimalTimingAnalysis> {
        const { profileId, timeRange, apiClient } = context;
        const config = { ...this.config.defaultConfig, ...context.config };

        if (!profileId) {
            throw new Error('Profile ID is required');
        }

        // Get historical analytics data
        const analyticsData = await apiClient.analytics.posts(profileId, {
            start: timeRange?.start,
            end: timeRange?.end,
        });

        if (analyticsData.length < config.minSampleSize) {
            throw new Error(`Insufficient data: ${analyticsData.length} posts, minimum ${config.minSampleSize} required`);
        }

        // Analyze posting patterns
        const timeSlotAnalysis = this.analyzeTimeSlots(analyticsData);
        const dayAnalysis = this.analyzeDayPatterns(analyticsData);
        const hourAnalysis = this.analyzeHourPatterns(analyticsData);

        // Generate recommendations
        const recommendations = this.generateRecommendations(timeSlotAnalysis, config.confidenceThreshold);

        // Get profile for service info
        const profile = await apiClient.profiles.get(profileId);

        return {
            profileId,
            service: profile.service,
            recommendations,
            analysis: {
                bestDays: dayAnalysis,
                bestHours: hourAnalysis,
            },
            confidence: this.calculateOverallConfidence(recommendations),
            lastUpdated: new Date().toISOString(),
        };
    }

    private analyzeTimeSlots(analytics: PostAnalytics[]): Map<string, { engagement: number; count: number }> {
        const timeSlots = new Map<string, { engagement: number; count: number }>();

        analytics.forEach(post => {
            const date = new Date(post.publishedAt);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            const key = `${dayOfWeek}-${hour}`;

            const existing = timeSlots.get(key) || { engagement: 0, count: 0 };
            timeSlots.set(key, {
                engagement: existing.engagement + post.engagementRate,
                count: existing.count + 1,
            });
        });

        return timeSlots;
    }

    private analyzeDayPatterns(analytics: PostAnalytics[]) {
        const dayStats = new Map<number, { engagement: number; count: number }>();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        analytics.forEach(post => {
            const dayOfWeek = new Date(post.publishedAt).getDay();
            const existing = dayStats.get(dayOfWeek) || { engagement: 0, count: 0 };
            dayStats.set(dayOfWeek, {
                engagement: existing.engagement + post.engagementRate,
                count: existing.count + 1,
            });
        });

        return Array.from(dayStats.entries())
            .map(([day, stats]) => ({
                dayOfWeek: day,
                dayName: dayNames[day],
                averageEngagement: stats.engagement / stats.count,
                postCount: stats.count,
                rank: 0, // Will be set after sorting
            }))
            .sort((a, b) => b.averageEngagement - a.averageEngagement)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }

    private analyzeHourPatterns(analytics: PostAnalytics[]) {
        const hourStats = new Map<number, { engagement: number; count: number }>();

        analytics.forEach(post => {
            const hour = new Date(post.publishedAt).getHours();
            const existing = hourStats.get(hour) || { engagement: 0, count: 0 };
            hourStats.set(hour, {
                engagement: existing.engagement + post.engagementRate,
                count: existing.count + 1,
            });
        });

        return Array.from(hourStats.entries())
            .map(([hour, stats]) => ({
                hour,
                averageEngagement: stats.engagement / stats.count,
                postCount: stats.count,
                rank: 0,
            }))
            .sort((a, b) => b.averageEngagement - a.averageEngagement)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }

    private generateRecommendations(
        timeSlots: Map<string, { engagement: number; count: number }>,
        confidenceThreshold: number
    ): TimeSlotRecommendation[] {
        const recommendations: TimeSlotRecommendation[] = [];

        timeSlots.forEach((stats, key) => {
            const [dayOfWeek, hour] = key.split('-').map(Number);
            const averageEngagement = stats.engagement / stats.count;
            const confidence = Math.min(stats.count / 10, 1); // More posts = higher confidence

            if (confidence >= confidenceThreshold) {
                recommendations.push({
                    dayOfWeek,
                    hour,
                    engagementScore: averageEngagement,
                    confidence,
                    sampleSize: stats.count,
                });
            }
        });

        return recommendations
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 10); // Top 10 recommendations
    }

    private calculateOverallConfidence(recommendations: TimeSlotRecommendation[]): number {
        if (recommendations.length === 0) return 0;

        const totalConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0);
        return totalConfidence / recommendations.length;
    }
}