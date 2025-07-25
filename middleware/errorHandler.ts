import { Request, Response, NextFunction } from 'express';
import { BufferAPIError } from '../utils/buffer-sdk';
import { ZodError } from 'zod';
import { Properties as config } from '../config';

export interface APIError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}

export const errorHandler = (
    error: APIError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('API Error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation error',
            details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code,
            })),
        });
    }

    // Handle Buffer API errors
    if (error instanceof BufferAPIError) {
        return res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }

    // Handle custom API errors
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
        });
    }

    // Default error
    res.status(500).json({
        error: 'Internal server error',
        ...(config.isDevelopment && { stack: error.stack }),
    });
};

// Helper function to create API errors
export const createAPIError = (
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
): APIError => {
    const error = new Error(message) as APIError;
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
};

// Common error responses
export const commonErrors = {
    notFound: (resource: string = 'Resource') =>
        createAPIError(`${resource} not found`, 404, 'NOT_FOUND'),

    unauthorized: (message: string = 'Unauthorized') =>
        createAPIError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message: string = 'Forbidden') =>
        createAPIError(message, 403, 'FORBIDDEN'),

    badRequest: (message: string = 'Bad request') =>
        createAPIError(message, 400, 'BAD_REQUEST'),

    conflict: (message: string = 'Conflict') =>
        createAPIError(message, 409, 'CONFLICT'),

    tooManyRequests: (message: string = 'Too many requests') =>
        createAPIError(message, 429, 'TOO_MANY_REQUESTS'),

    internalServer: (message: string = 'Internal server error') =>
        createAPIError(message, 500, 'INTERNAL_SERVER_ERROR'),
};