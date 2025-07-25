import express from 'express';
import PostService from '../services/PostService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {Inject} from "typescript-ioc";
import {ContextRequest, ContextResponse, GET, Path, PathParam, POST} from "typescript-rest";
import {responseGetTemplate,responsePostTemplate} from "../utils";
import {CreatePostSchema} from "../dto";

@Path("/api/v1/posts")
export class PostController {
    @Inject
    private postService!: PostService;

    @Path("/:profileId")
    @GET
    public async list(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const options = {
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            count: req.query.count ? parseInt(req.query.count as string) : undefined,
            status: req.query.status as any,
            since: req.query.since as string,
            until: req.query.until as string,
        };

        return responseGetTemplate(
            async () => this.postService.getPosts(profileId, req.user!.id, options),
            res
        );
    }

    @Path("/:profileId")
    @POST
    public async create(
        @PathParam("profileId") profileId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        const postData = CreatePostSchema.parse(req.body);

        return responsePostTemplate(
            async () => this.postService.createPost(profileId, req.user!.id, postData),
            res
        );
    }

    @Path("/single/:postId")
    @GET
    public async get(
        @PathParam("postId") postId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        return responseGetTemplate(
            async () => this.postService.getPost(postId, req.user!.id),
            res
        );
    }

    @Path("/analytics/:postId")
    @GET
    public async getAnalytics(
        @PathParam("postId") postId: string,
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        return responseGetTemplate(
            async () => this.postService.getPostAnalytics(postId, req.user!.id),
            res
        );
    }

    @Path("/profiles")
    @GET
    public async getProfiles(
        @ContextRequest req: AuthenticatedRequest,
        @ContextResponse res: express.Response
    ) {
        return responseGetTemplate(
            async () => this.postService.getUserProfiles(req.user!.id),
            res
        );
    }
}