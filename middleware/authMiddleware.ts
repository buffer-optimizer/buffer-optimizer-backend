import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {Properties as config, RSAKey} from '../config';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        profiles: string[];
    };
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    // Skip auth in demo mode
    if (config.buffer.mockMode) {
        req.user = {
            id: 'demo_user',
            email: 'demo@bufferapp.com',
            profiles: ['profile_twitter_001', 'profile_linkedin_002'],
        };
        return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        req.user = jwt.verify(token, RSAKey.getPublicKey()) as any;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid access token' });
    }
};