import express from "express";
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PluginRegistry } from '../plugins/registry';
import { createBufferClient } from '../utils/buffer-sdk';
import { Properties as config } from '../config';
import {PluginExecutionSchema} from "../dto";
import {ContextRequest, ContextResponse, GET, Path, PathParam, POST} from "typescript-rest";
import {responseGetTemplate} from "../utils";
import responseTemplate from "../utils/responsePostTemplate";
import axios from 'axios';

@Path("/api/v1/plugins")
export class PluginController {

    @Path("/")
    @GET
    public async list(@ContextRequest req: express.Request,
                      @ContextResponse res: express.Response) {
        const pluginRegistry = req.app.locals.pluginRegistry as PluginRegistry;
        return responseGetTemplate(async () =>  pluginRegistry.getAvailablePlugins(), res);
    }

    @Path("/:pluginId")
    @GET
    public async get(@PathParam("pluginId") pluginId: string, @ContextRequest req: express.Request,
                      @ContextResponse res: express.Response) {
        const pluginRegistry = req.app.locals.pluginRegistry as PluginRegistry;

        return responseGetTemplate(async () =>  pluginRegistry.getPlugin(pluginId), res);
    }

    @Path("/:pluginId/execute")
    @POST
    public async execute(@PathParam("pluginId") pluginId: string, @ContextRequest req: AuthenticatedRequest,
                     @ContextResponse res: express.Response) {
        const pluginRegistry = req.app.locals.pluginRegistry as PluginRegistry;
        const executionData = PluginExecutionSchema.parse(req.body);

        return responseTemplate(async () =>  {
            const apiClient = await createBufferClient({
                bufferSDK: config.buffer
            });
            const data = await pluginRegistry.execute(pluginId, {
                ...executionData,
                apiClient,
            })
            return {state: true, data}
        }, res);
    }

    @Path("/execute-all")
    @POST
    public async executeAll(@ContextRequest req: AuthenticatedRequest,
                             @ContextResponse res: express.Response) {
        const pluginRegistry = req.app.locals.pluginRegistry as PluginRegistry;
        const executionData = PluginExecutionSchema.parse(req.body);

        return responseTemplate(async () =>  {
            const apiClient = await createBufferClient({
                bufferSDK: config.buffer,
            });
            const results = await pluginRegistry.executeAll({
                ...executionData,
                apiClient,
            })
            // Convert Map to Object for JSON serialization
            const data = Object.fromEntries(results);

            return {state: true, data}
        }, res);
    }
}