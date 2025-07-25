import {
    AnalyticsSummary,
    Plugin,
    PluginExecutionContext,
    PostAnalytics,
    TimeRange,
} from '../utils/buffer-sdk';

export class PerformanceAnalyticsPlugin implements Plugin {
    id = 'performance-analytics';
    name = 'Performance Analytics Pro';
    version = '1.0.0';
    description = 'Provides comprehensive performance analytics and insights';
    author = 'Buffer Optimizer Team';
    category = 'analytics' as const;
    enabled = true;

    config = {
        requiresAuth: true,
        configSchema: {
            minSampleSize: {
                type: 'number' as const,
                label: 'Minimum Sample Size',
                description: 'Minimum number of posts required for analysis',
                required: false,
                default: 1,
            },
        },
        defaultConfig: {
            minSampleSize: 1,
        },
    };

    async initialize(context: PluginExecutionContext): Promise<void> {
        this.validateContext(context);
    }

    async execute(context: PluginExecutionContext): Promise<AnalyticsSummary> {
        const { profileId, timeRange, apiClient, config } = context;

        this.validateContext(context);

        const analyticsData = await this.fetchAnalyticsData(apiClient, profileId!, timeRange);

        // Check minimum sample size
        const minSampleSize = config?.minSampleSize || this.config.defaultConfig.minSampleSize;
        if (analyticsData.length < minSampleSize) {
            throw new Error(`Insufficient data: ${analyticsData.length} posts, minimum ${minSampleSize} required`);
        }

        return this.generateSummary(analyticsData, profileId!, timeRange);
    }

    // ✅ DRY: Centralized validation logic
    private validateContext(context: PluginExecutionContext): void {
        if (!context.profileId) {
            throw new Error('Profile ID is required for performance analytics');
        }
        if (!context.apiClient) {
            throw new Error('API client is required for performance analytics');
        }
    }

    // ✅ DRY: Separated data fetching logic
    private async fetchAnalyticsData(
        apiClient: any,
        profileId: string,
        timeRange?: { start?: string; end?: string }
    ): Promise<PostAnalytics[]> {
        const analyticsData = await apiClient.analytics.posts(profileId, {
            start: timeRange?.start,
            end: timeRange?.end,
        });

        if (analyticsData.length === 0) {
            throw new Error('No analytics data available for the specified time range');
        }

        return analyticsData;
    }

    // ✅ DRY: Single method for summary generation
    private generateSummary(
        analytics: PostAnalytics[],
        profileId: string,
        timeRange?: { start?: string; end?: string }
    ): AnalyticsSummary {
        // Calculate basic metrics using helper methods
        const basicMetrics = this.calculateBasicMetrics(analytics);
        const bestPerformingPost = this.findBestPerformingPost(analytics);
        const timeRangeValue = this.determineTimeRange(timeRange);

        return {
            profileId,
            timeRange: timeRangeValue,
            ...basicMetrics,
            bestPerformingPost: bestPerformingPost.postId,
            topPerformingTime: this.findTopPerformingTime(analytics),
            topMetrics: this.calculateTopMetrics(analytics),
            platformBreakdown: this.calculatePlatformBreakdown(analytics),
            trending: this.calculateTrending(analytics),
        };
    }

    // ✅ DRY: Helper method for basic metrics calculation
    private calculateBasicMetrics(analytics: PostAnalytics[]) {
        const totalPosts = analytics.length;
        const totalEngagement = analytics.reduce((sum, post) =>
            sum + this.calculatePostEngagement(post), 0
        );
        const averageEngagementRate = analytics.reduce((sum, post) =>
            sum + post.engagementRate, 0
        ) / totalPosts;

        return {
            totalPosts,
            totalEngagement,
            averageEngagementRate,
        };
    }

    // ✅ DRY: Helper method for post engagement calculation
    private calculatePostEngagement(post: PostAnalytics): any {
        return Object.values(post.metrics).reduce((sum: any, value: any) => sum + (value || 0), 0);
    }

    // ✅ DRY: Helper method to find best performing post
    private findBestPerformingPost(analytics: PostAnalytics[]): PostAnalytics {
        return analytics.reduce((best, current) =>
            current.engagementRate > best.engagementRate ? current : best
        );
    }

    // ✅ DRY: Helper method to determine time range
    private determineTimeRange(timeRange?: { start?: string; end?: string }): TimeRange {
        if (!timeRange?.start || !timeRange?.end) {
            return '30d';
        }

        const startDate = new Date(timeRange.start);
        const endDate = new Date(timeRange.end);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 7) return '7d';
        if (daysDiff <= 30) return '30d';
        if (daysDiff <= 90) return '90d';
        return '1y';
    }

    private calculatePlatformBreakdown(analytics: PostAnalytics[]): AnalyticsSummary['platformBreakdown'] {
        const platformStats = this.aggregatePlatformStats(analytics);

        return Array.from(platformStats.entries()).map(([platform, stats]) => ({
            platform,
            postCount: stats.postCount,
            engagementRate: stats.totalEngagementRate / stats.postCount,
            reach: stats.totalReach,
        }));
    }

    // ✅ DRY: Helper method for platform stats aggregation
    private aggregatePlatformStats(analytics: PostAnalytics[]) {
        const platformStats = new Map();

        analytics.forEach(post => {
            const service = post.service;
            const existing = platformStats.get(service) || {
                postCount: 0,
                totalEngagement: 0,
                totalEngagementRate: 0,
                totalReach: 0,
            };

            platformStats.set(service, {
                postCount: existing.postCount + 1,
                totalEngagement: existing.totalEngagement + this.calculatePostEngagement(post),
                totalEngagementRate: existing.totalEngagementRate + post.engagementRate,
                totalReach: existing.totalReach + post.reach,
            });
        });

        return platformStats;
    }

    private calculateTopMetrics(analytics: PostAnalytics[]): AnalyticsSummary['topMetrics'] {
        return analytics.reduce(
            (totals, post) => ({
                likes: totals.likes + (post.metrics.likes || 0),
                comments: totals.comments + (post.metrics.comments || 0),
                shares: totals.shares + (post.metrics.shares || 0),
                clicks: totals.clicks + (post.metrics.clicks || 0),
                reach: totals.reach + post.reach,
                impressions: totals.impressions + post.impressions,
            }),
            { likes: 0, comments: 0, shares: 0, clicks: 0, reach: 0, impressions: 0 }
        );
    }

    private calculateTrending(analytics: PostAnalytics[]): AnalyticsSummary['trending'] {
        if (analytics.length < 2) {
            return { direction: 'stable', percentage: 0 };
        }

        const { firstHalf, secondHalf } = this.splitAnalyticsByTime(analytics);
        const firstHalfAvg = this.calculateAverageEngagement(firstHalf);
        const secondHalfAvg = this.calculateAverageEngagement(secondHalf);

        return this.calculateTrendDirection(firstHalfAvg, secondHalfAvg);
    }

    // ✅ DRY: Helper method to split analytics by time
    private splitAnalyticsByTime(analytics: PostAnalytics[]) {
        const sortedPosts = [...analytics].sort((a, b) =>
            new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );

        const halfPoint = Math.floor(sortedPosts.length / 2);
        return {
            firstHalf: sortedPosts.slice(0, halfPoint),
            secondHalf: sortedPosts.slice(halfPoint),
        };
    }

    // ✅ DRY: Helper method to calculate average engagement
    private calculateAverageEngagement(posts: PostAnalytics[]): number {
        if (posts.length === 0) return 0;
        return posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length;
    }

    // ✅ DRY: Helper method to calculate trend direction
    private calculateTrendDirection(firstAvg: number, secondAvg: number): AnalyticsSummary['trending'] {
        if (firstAvg === 0) {
            return { direction: 'stable', percentage: 0 };
        }

        const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

        let direction: 'up' | 'down' | 'stable';
        if (Math.abs(percentageChange) < 5) {
            direction = 'stable';
        } else if (percentageChange > 0) {
            direction = 'up';
        } else {
            direction = 'down';
        }

        return {
            direction,
            percentage: Math.abs(Math.round(percentageChange)),
        };
    }

    private findTopPerformingTime(analytics: PostAnalytics[]): string {
        const hourStats = this.aggregateHourlyStats(analytics);
        return this.findBestHour(hourStats);
    }

    // ✅ DRY: Helper method for hourly stats aggregation
    private aggregateHourlyStats(analytics: PostAnalytics[]) {
        const hourStats = new Map<number, { engagement: number; count: number }>();

        analytics.forEach(post => {
            const hour = new Date(post.publishedAt).getHours();
            const existing = hourStats.get(hour) || { engagement: 0, count: 0 };
            hourStats.set(hour, {
                engagement: existing.engagement + post.engagementRate,
                count: existing.count + 1,
            });
        });

        return hourStats;
    }

    // ✅ DRY: Helper method to find best performing hour
    private findBestHour(hourStats: Map<number, { engagement: number; count: number }>): string {
        let bestHour = 0;
        let bestAverage = 0;

        hourStats.forEach((stats, hour) => {
            const average = stats.engagement / stats.count;
            if (average > bestAverage) {
                bestAverage = average;
                bestHour = hour;
            }
        });

        return `${bestHour.toString().padStart(2, '0')}:00`;
    }

    // ✅ Combined validation method (DRY principle)
    async validate(context: PluginExecutionContext): Promise<boolean> {
        try {
            this.validateContext(context);
            return true;
        } catch (error) {
            console.warn(`Performance Analytics Plugin validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    async cleanup(): Promise<void> {
        console.log('Performance Analytics Plugin cleanup completed');
    }
}