import {
    PostAnalytics,
    AnalyticsSummary,
    OptimalTimingAnalysis,
    DashboardStats,
    AnalyticsOptions,
    createBufferClient
} from '../utils/buffer-sdk';
import { Properties as config } from '../config';
import axios from "axios";

export default class AnalyticsService {
    private bufferClient = createBufferClient({bufferSDK: config.buffer});

    async getPostAnalytics(
        profileId: string,
        userId: string,
        options: Partial<AnalyticsOptions> = {}
    ): Promise<PostAnalytics[]> {
        try {
            return (await this.bufferClient).analytics.posts(profileId, options);
        } catch (error) {
            console.error('Error fetching post analytics:', error);
            throw error;
        }
    }

    async getAnalyticsSummary(
        profileId: string,
        userId: string,
        options: Partial<AnalyticsOptions> = {}
    ): Promise<AnalyticsSummary> {
        try {
            return await (await this.bufferClient).analytics.summary(profileId, options);
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            throw error;
        }
    }

    async getOptimalTimes(
        profileId: string,
        userId: string,
        options: Partial<AnalyticsOptions> = {}
    ): Promise<OptimalTimingAnalysis> {
        try {
            // This would typically be computed from historical data
            // For demo purposes, we'll return mock optimal timing data
            const profile = await (await this.bufferClient).profiles.get(profileId);

            return {
                profileId,
                service: profile.service,
                recommendations: [
                    { dayOfWeek: 1, hour: 9, engagementScore: 0.08, confidence: 0.85, sampleSize: 45 },
                    { dayOfWeek: 1, hour: 14, engagementScore: 0.075, confidence: 0.82, sampleSize: 38 },
                    { dayOfWeek: 2, hour: 10, engagementScore: 0.072, confidence: 0.78, sampleSize: 42 },
                    { dayOfWeek: 3, hour: 15, engagementScore: 0.069, confidence: 0.81, sampleSize: 36 },
                    { dayOfWeek: 4, hour: 11, engagementScore: 0.065, confidence: 0.76, sampleSize: 33 },
                ],
                analysis: {
                    bestDays: [
                        { dayOfWeek: 1, dayName: 'Monday', averageEngagement: 0.067, postCount: 83, rank: 1 },
                        { dayOfWeek: 2, dayName: 'Tuesday', averageEngagement: 0.062, postCount: 79, rank: 2 },
                        { dayOfWeek: 3, dayName: 'Wednesday', averageEngagement: 0.058, postCount: 75, rank: 3 },
                        { dayOfWeek: 4, dayName: 'Thursday', averageEngagement: 0.055, postCount: 71, rank: 4 },
                        { dayOfWeek: 5, dayName: 'Friday', averageEngagement: 0.048, postCount: 68, rank: 5 },
                        { dayOfWeek: 6, dayName: 'Saturday', averageEngagement: 0.041, postCount: 45, rank: 6 },
                        { dayOfWeek: 0, dayName: 'Sunday', averageEngagement: 0.038, postCount: 39, rank: 7 },
                    ],
                    bestHours: [
                        { hour: 9, averageEngagement: 0.071, postCount: 28, rank: 1 },
                        { hour: 14, averageEngagement: 0.068, postCount: 32, rank: 2 },
                        { hour: 10, averageEngagement: 0.065, postCount: 29, rank: 3 },
                        { hour: 15, averageEngagement: 0.062, postCount: 31, rank: 4 },
                        { hour: 11, averageEngagement: 0.059, postCount: 26, rank: 5 },
                    ],
                },
                confidence: 0.8,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error generating optimal times:', error);
            throw error;
        }
    }

    async getDashboardData(
        profileId: string,
        userId: string,
        options: Partial<AnalyticsOptions> = {}
    ): Promise<DashboardStats> {
        try {
            const [summary, optimalTimes, posts] = await Promise.all([
                this.getAnalyticsSummary(profileId, userId, options),
                this.getOptimalTimes(profileId, userId, options),
                this.getPostAnalytics(profileId, userId, options),
            ]);

            // Calculate week-over-week growth (simplified)
            const currentPosts = posts.filter((post: any) => {
                const postDate = new Date(post.publishedAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return postDate >= weekAgo;
            });

            const previousPosts = posts.filter((post: any) => {
                const postDate = new Date(post.publishedAt);
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return postDate >= twoWeeksAgo && postDate < weekAgo;
            });

            const currentEngagement = currentPosts.reduce((sum: any, post: any) => sum + post.engagementRate, 0) / currentPosts.length || 0;
            const previousEngagement = previousPosts.reduce((sum: any, post: any) => sum + post.engagementRate, 0) / previousPosts.length || 0;
            const weekOverWeekGrowth = previousEngagement > 0 ? ((currentEngagement - previousEngagement) / previousEngagement) * 100 : 0;

            // Find best performing post
            const bestPost = posts.reduce((best: any, current: any) =>
                current.engagementRate > best.engagementRate ? current : best
            );

            // Get best performing platform
            const platformEngagement = new Map<string, number>();
            posts.forEach((post: any) => {
                const current = platformEngagement.get(post.service) || 0;
                platformEngagement.set(post.service, current + post.engagementRate);
            });

            const bestPlatform = Array.from(platformEngagement.entries())
                .reduce((best, [platform, engagement]) =>
                        engagement > best.engagement ? { platform, engagement } : best,
                    { platform: 'x', engagement: 0 }
                ).platform as any;

            return {
                totalPosts: summary.totalPosts,
                averageEngagementRate: summary.averageEngagementRate,
                bestPerformingPlatform: bestPlatform,
                recommendedPostTime: optimalTimes.analysis.bestHours[0] ?
                    `${optimalTimes.analysis.bestHours[0].hour.toString().padStart(2, '0')}:00` : '14:00',
                weekOverWeekGrowth,
                topPerformingPost: {
                    id: bestPost.postId,
                    text: bestPost.text,
                    engagementRate: bestPost.engagementRate,
                },
            };
        } catch (error) {
            console.error('Error generating dashboard data:', error);
            throw error;
        }
    }
}