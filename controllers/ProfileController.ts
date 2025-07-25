import express from 'express';
import PostService from '../services/PostService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {Inject} from "typescript-ioc";
import {ContextRequest, ContextResponse, GET, Path, PathParam, POST} from "typescript-rest";
import {responseGetTemplate} from "../utils";

@Path("/api/v1/profiles")
export class PostController {
    @Inject
    private postService!: PostService;

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