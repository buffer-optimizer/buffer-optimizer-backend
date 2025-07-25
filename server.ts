import {BootstrapApplication,Properties as config} from "./config";
import {authMiddleware} from "./middleware/authMiddleware";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import {PerformanceAnalyticsPlugin} from "./plugins/performance-analytics";
import {OptimalTimingPlugin} from "./plugins/optimal-timing";
import {PluginRegistry} from "./plugins/registry";

@BootstrapApplication
class BufferOptimizer {
    constructor(app: any, express: any) {
        // Security middleware
        app.use(helmet());
        app.use(cors({
            origin: config.cors.origins,
            credentials: true,
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: { error: 'Too many requests, please try again later.' },
        });

        app.use('/api/', limiter);

        // Body parsing and compression
        app.use(compression());
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true }));

        // Logging
        app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

        // Set Middleware for API Routes
        app.use('/api/v1/*',authMiddleware);

        // Initialize plugin registry
        const pluginRegistry = new PluginRegistry();
        pluginRegistry.register(new OptimalTimingPlugin());
        pluginRegistry.register(new PerformanceAnalyticsPlugin());

        // Make plugin registry available to routes
        app.locals.pluginRegistry = pluginRegistry;

        // Error handling
        app.use(errorHandler);

    }
}