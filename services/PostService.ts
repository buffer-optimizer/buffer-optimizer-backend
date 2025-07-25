import {
    BufferPost,
    BufferProfile,
    createBufferClient, CreatePostData, PostAnalytics, PostListOptions
} from '../utils/buffer-sdk';
import axios from "axios";
import { Properties as config } from '../config';

export default class PostService {
    private bufferClient = createBufferClient({
        bufferSDK: config.buffer
    });

    async getPosts(
        profileId: string,
        userId: string,
        options: PostListOptions = {}
    ): Promise<BufferPost[]> {
        try {
            return await (await this.bufferClient).posts.list(profileId, options);
        } catch (error) {
            console.error(`Error fetching posts for profile ${profileId}:`, error);
            throw error;
        }
    }

    async getPost(postId: string, userId: string): Promise<BufferPost> {
        try {
            return await (await this.bufferClient).posts.get(postId);
        } catch (error) {
            console.error(`Error fetching post ${postId}:`, error);
            throw error;
        }
    }
    async getUserProfiles(userId: string): Promise<BufferProfile[]> {
        try {
            return await (await this.bufferClient).profiles.list();
        } catch (error) {
            console.error('Error fetching user profiles:', error);
            throw error;
        }
    }

    async createPost(
        profileId: string,
        userId: string,
        data: CreatePostData
    ): Promise<BufferPost> {
        try {
            return await (await this.bufferClient).posts.create(profileId, data);
        } catch (error) {
            console.error(`Error creating post for profile ${profileId}:`, error);
            throw error;
        }
    }

    async getPostAnalytics(postId: string, userId: string): Promise<PostAnalytics> {
        try {
            return await (await this.bufferClient).posts.analytics(postId);
        } catch (error) {
            console.error(`Error fetching analytics for post ${postId}:`, error);
            throw error;
        }
    }

    async getProfile(profileId: string, userId: string): Promise<BufferProfile> {
        try {
            // In a real app, you'd verify the user has access to this profile
            return await (await this.bufferClient).profiles.get(profileId);
        } catch (error) {
            console.error(`Error fetching profile ${profileId}:`, error);
            throw error;
        }
    }
}