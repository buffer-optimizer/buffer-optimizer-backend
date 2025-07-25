# Buffer Content Optimizer Backend

> **Disclaimer: This project is created solely for demonstration purposes as part of a job application to Buffer. It is not affiliated with, endorsed by, or representative of Buffer's actual products or services. This is a technical showcase designed to demonstrate backend development skills and is not intended for commercial use.**

## 🎯 Overview

The Buffer Content Optimizer Backend is a robust RESTful API built with Express.js and TypeScript, providing comprehensive social media analytics and optimization services. This backend serves as the data layer for the Buffer Content Optimizer platform, featuring a plugin-based architecture, real-time analytics processing, and scalable API design.

## 🏗️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Architecture**: RESTful API
- **Port**: 8085
- **Data Layer**: Mock data services (production-ready structure)

## 📁 Project Structure

```
buffer-optimizer-backend/
├── .env                    # Environment variables
├── config/                 # Configuration files
├── controllers/            # Route controllers
├── dto/                    # Data Transfer Objects
├── enums/                  # TypeScript enumerations
├── middleware/             # Custom middleware
├── plugins/                # Plugin system implementation
├── resources/              # Static resources and data
├── services/               # Business logic layer
├── utils/                  # Utility functions
├── rest.config             # REST API configuration
├── server.ts               # Application entry point
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- TypeScript knowledge

### Installation

1. **Navigate to the backend directory**
   ```bash
   cd buffer-optimizer-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   application.name=BufferOptimizer
   PORT=8085
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   BUFFER_CLIENT_ID='demo_client_id'
   BUFFER_CLIENT_SECRET='demo_client_secret'
   BUFFER_CLIENT_GRANT_TYPE='authorization_code'
   BUFFER_MOCK_MODE='true'
   BUFFER_SDK_MOCK_MODE='false'
   
   # RSA Key Credentials
   RSA_PRIVATE_KEY="/resources/private.key"
   RSA_PUBLIC_KEY="/resources/public.key"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify the server is running**
   Navigate to `http://localhost:8085/api/v1/health`

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Run TypeScript compiler check

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## 🛠️ API Architecture

### Base URL
```
http://localhost:8085/api/v1
```

### Core Endpoints

#### Profiles
```
GET /api/v1/profiles                    # Get all user profiles
```

#### Posts
```
GET  /api/v1/posts/:profileId           # Get posts for a profile
POST /api/v1/posts/:profileId           # Create new post for profile
GET  /api/v1/posts/single/:postId       # Get specific post
GET  /api/v1/posts/analytics/:postId    # Get post analytics
GET  /api/v1/posts/profiles             # Get user profiles (alternative endpoint)
```

#### Analytics
```
GET /api/v1/analytics/posts/:profileId         # Post analytics for profile
GET /api/v1/analytics/summary/:profileId       # Analytics summary
GET /api/v1/analytics/optimal-times/:profileId # Optimal posting times
GET /api/v1/analytics/dashboard/:profileId     # Dashboard data
```

#### Plugins
```
GET  /api/v1/plugins                    # List available plugins
GET  /api/v1/plugins/:pluginId          # Get specific plugin details
POST /api/v1/plugins/:pluginId/execute  # Execute specific plugin
POST /api/v1/plugins/execute-all        # Execute all enabled plugins
```

## 🎛️ Controller Architecture

### Analytics Controller
```typescript
@Path("/api/v1/analytics")
export class AnalyticsController {
  // Handles analytics data retrieval with authentication
  // Uses dependency injection for AnalyticsService
  // Implements query parameter validation with Zod schemas
}
```

### Plugin Controller
```typescript
@Path("/api/v1/plugins")
export class PluginController {
  // Manages plugin execution and registry
  // Integrates with Buffer SDK client
  // Supports individual and batch plugin execution
}
```

### Post Controller
```typescript
@Path("/api/v1/posts")
export class PostController {
  // Handles post CRUD operations
  // Provides post analytics endpoints
  // Manages profile relationships
}
```

### Profile Controller
```typescript
@Path("/api/v1/profiles")
export class ProfileController {
  // Manages social media profile data
  // User-specific profile retrieval
}
```

## 📊 Data Transfer Objects (DTOs)

### Analytics Query Schema
```typescript
// Zod validation for analytics endpoints
const AnalyticsQuerySchema = z.object({
  period: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Additional query parameters
});
```

### Plugin Execution Schema
```typescript
// Zod validation for plugin execution
const PluginExecutionSchema = z.object({
  profileId: z.string(),
  parameters: z.record(z.any()).optional(),
  // Plugin-specific execution parameters
});
```

### Create Post Schema
```typescript
// Zod validation for post creation
const CreatePostSchema = z.object({
  text: z.string(),
  scheduledAt: z.string().optional(),
  media: z.array(z.string()).optional(),
  // Post creation parameters
});
```

### Authentication Integration
```typescript
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    // Additional user properties
  };
}
```

## 🛡️ Middleware

### Authentication Middleware
```typescript
// Custom authentication middleware for protected routes
interface AuthenticatedRequest extends express.Request {
  user?: { id: string };
}

// Applied to controllers requiring user authentication
// Validates tokens and populates req.user with user data
```

### Rate Limiting
```typescript
// Prevents API abuse with configurable limits
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### CORS Configuration
```typescript
// Enables cross-origin requests from multiple origins
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

### Error Handling
```typescript
// Global error handler with structured responses
app.use(errorHandler);
```

## 🔌 Plugin System

The backend features an extensible plugin architecture supporting:

### Plugin Registry
```typescript
// Plugin management through registry pattern
const pluginRegistry = req.app.locals.pluginRegistry as PluginRegistry;

// Available operations:
- getAvailablePlugins(): Get all registered plugins
- getPlugin(pluginId): Get specific plugin details  
- execute(pluginId, params): Execute individual plugin
- executeAll(params): Execute all enabled plugins
```

### Plugin Integration
- **Buffer SDK Integration**: Plugins utilize Buffer API client
- **Authentication**: All plugin executions require user authentication
- **Validation**: Request data validated with Zod schemas
- **Serialization**: Results converted from Map to Object for JSON response

### Plugin Execution Flow
1. Parse and validate execution parameters with `PluginExecutionSchema`
2. Create authenticated Buffer API client
3. Execute plugin(s) with API client and parameters
4. Return structured response with execution results

### Plugin Categories
- **Analytics Plugins**: Performance tracking, competitor analysis
- **Optimization Plugins**: Timing analysis, hashtag optimization
- **Content Plugins**: AI content suggestions, visual optimization
- **Reporting Plugins**: Custom reports, crisis monitoring

### REST Configuration (`rest.config`)
```json
{
  "apiVersion": "v1",
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  },
  "pagination": {
    "defaultLimit": 20,
    "maxLimit": 100
  },
  "cache": {
    "ttl": 300,
    "enabled": true
  }
}
```

### REST Configuration (`rest.config`)
```json
{
  "apiVersion": "v1",
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  },
  "pagination": {
    "defaultLimit": 20,
    "maxLimit": 100
  },
  "cache": {
    "ttl": 300,
    "enabled": true
  }
}
```

## 🔧 Buffer SDK Integration

### Buffer Client Configuration
```typescript
// Buffer API client creation with demo credentials
const bufferClient = await createBufferClient({
  bufferSDK: {
    clientId: process.env.BUFFER_CLIENT_ID,
    clientSecret: process.env.BUFFER_CLIENT_SECRET,
    grantType: process.env.BUFFER_CLIENT_GRANT_TYPE,
    mockMode: process.env.BUFFER_MOCK_MODE === 'true',
    sdkMockMode: process.env.BUFFER_SDK_MOCK_MODE === 'true'
  }
});
```

### Mock Mode Operation
- **Development Environment**: Uses mock Buffer API responses
- **Demo Credentials**: Safe demo client ID and secret for testing
- **SDK Integration**: Full Buffer SDK integration for plugin execution
- **Realistic Data**: Mock responses simulate real Buffer API behavior

## 🔐 Authentication & Security

### RSA Key Authentication
```typescript
// RSA public/private key pair for JWT signing
privateKey: fs.readFileSync(process.env.RSA_PRIVATE_KEY!)
publicKey: fs.readFileSync(process.env.RSA_PUBLIC_KEY!)
```

### Security Features
- **RSA Encryption**: Asymmetric key cryptography for JWT tokens
- **File-based Keys**: Secure key storage in `/resources/` directory
- **Environment Isolation**: Separate configurations for development/production
- **CORS Protection**: Multi-origin support for development environments

## 🔧 Services Layer

### Analytics Service
```typescript
@Injectable
class AnalyticsService {
  async getPostAnalytics(profileId: string, userId: string, options: AnalyticsOptions): Promise<PostAnalytics[]>
  async getAnalyticsSummary(profileId: string, userId: string, options: AnalyticsOptions): Promise<AnalyticsSummary>
  async getOptimalTimes(profileId: string, userId: string, options: AnalyticsOptions): Promise<OptimalTimingData>
  async getDashboardData(profileId: string, userId: string, options: AnalyticsOptions): Promise<DashboardData>
}
```

### Post Service
```typescript
@Injectable  
class PostService {
  async getPosts(profileId: string, userId: string, options: PostOptions): Promise<Post[]>
  async createPost(profileId: string, userId: string, postData: CreatePostData): Promise<Post>
  async getPost(postId: string, userId: string): Promise<Post>
  async getPostAnalytics(postId: string, userId: string): Promise<PostAnalytics>
  async getUserProfiles(userId: string): Promise<Profile[]>
}
```

## 📈 Performance Optimizations

- **Caching**: Redis-ready caching layer for frequently accessed data
- **Database Indexing**: Optimized queries with proper indexing strategy
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Efficient database connection management
- **Rate Limiting**: API protection against abuse
- **Response Pagination**: Large datasets served in manageable chunks

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### API Testing with Postman
Import the provided Postman collection for comprehensive API testing:
```
/resources/postman/buffer-optimizer-api.postman_collection.json
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
EXPOSE 8085
CMD ["npm", "start"]
```

### Environment Variables
```env
# Application Configuration
application.name=BufferOptimizer
PORT=8085
NODE_ENV=development

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Buffer SDK Configuration
BUFFER_CLIENT_ID='demo_client_id'
BUFFER_CLIENT_SECRET='demo_client_secret'
BUFFER_CLIENT_GRANT_TYPE='authorization_code'
BUFFER_MOCK_MODE='true'
BUFFER_SDK_MOCK_MODE='false'

# Security & Authentication
RSA_PRIVATE_KEY="/resources/private.key"
RSA_PUBLIC_KEY="/resources/public.key"
```

## 📊 Monitoring & Logging

- **Request Logging**: Winston-based structured logging
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Health Checks**: Automated health monitoring endpoints

## 🔒 Security Features

- **Input Validation**: Joi-based request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Secure cross-origin requests
- **JWT Authentication**: Secure token-based authentication

## 📄 API Documentation

Complete API documentation is available via:
- **Postman Collection**: `/resources/postman/`

## 🤝 Contributing

This is a demonstration project. For evaluation purposes:

1. Review the code structure and architecture
2. Test the API endpoints using provided Postman collection
3. Examine the plugin system implementation
4. Verify TypeScript type safety and error handling

## 📞 Contact

**Kingsley Baah Brew**
- Email: kingsleybrew@gmail.com
- LinkedIn: [linkedin.com/in/kingsleybaahbrew](https://gh.linkedin.com/in/kingsley-brew-56881b172)
- GitHub: [github.com/kingsbrew94](https://github.com/kingsbrew94)

---

## ⚠️ **IMPORTANT DISCLAIMER**

**This backend API is created exclusively for demonstration purposes as part of a job application process. It is not affiliated with, endorsed by, or representative of Buffer. or any of its products or services.**

### Technical Demonstration

This project showcases:
- **RESTful API Design**: Modern API architecture patterns
- **TypeScript Implementation**: Type-safe backend development
- **Plugin Architecture**: Extensible system design
- **Error Handling**: Comprehensive error management
- **Security Practices**: Industry-standard security measures
- **Testing Strategy**: Unit and integration testing approaches
- **Documentation**: Professional API documentation

**All data is mock data for demonstration purposes. No real social media integrations or user data processing occurs.**

---

*Created with ❤️ by Kingsley Baah Brew for Buffer - Demonstrating backend engineering excellence*