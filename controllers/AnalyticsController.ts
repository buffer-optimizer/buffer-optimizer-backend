import {
    ContextRequest,
    GET,
    Path,
    ContextResponse,
    PathParam
} from "typescript-rest";
import express from "express";
import {Inject} from "typescript-ioc";
import AnalyticsService from "../services/AnalyticsService";
import {AnalyticsQuerySchema, queryToAnalyticsOptions} from "../dto";
import {responseGetTemplate} from "../utils";
import { AuthenticatedRequest } from '../middleware/authMiddleware';

@Path("/api/v1/analytics")
export class AnalyticsController {

    @Inject
    private analyticsService!: AnalyticsService;

    @Path("/posts/:profileId")
    @GET
    public async getPosts(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const queryParams = AnalyticsQuerySchema.parse(req.query);
        const analyticsOptions = queryToAnalyticsOptions(queryParams);

        return responseGetTemplate(async () => this.analyticsService.getPostAnalytics(
            profileId,
            req.user!.id,
            analyticsOptions
        ), res);
    }

    @Path("/summary/:profileId")
    @GET
    public async getSummary(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const queryParams = AnalyticsQuerySchema.parse(req.query);
        const analyticsOptions = queryToAnalyticsOptions(queryParams);

        return responseGetTemplate(async () => this.analyticsService.getAnalyticsSummary(
            profileId,
            req.user!.id,
            analyticsOptions
        ), res);
    }

    @Path("/optimal-times/:profileId")
    @GET
    public async getOptimalTimes(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const queryParams = AnalyticsQuerySchema.parse(req.query);
        const analyticsOptions = queryToAnalyticsOptions(queryParams);

        return responseGetTemplate(async () => this.analyticsService.getOptimalTimes(
            profileId,
            req.user!.id,
            analyticsOptions
        ), res);
    }

    @Path("/dashboard/:profileId")
    @GET
    public async getDashboardData(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const queryParams = AnalyticsQuerySchema.parse(req.query);
        const analyticsOptions = queryToAnalyticsOptions(queryParams);

        return responseGetTemplate(async () => this.analyticsService.getDashboardData(
            profileId,
            req.user!.id,
            analyticsOptions
        ), res);
    }
}