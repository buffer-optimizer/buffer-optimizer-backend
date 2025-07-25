const Properties = {
    environment: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    cors: {
        origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    },
    buffer: {
        grantId: process.env.BUFFER_CLIENT_GRANT_TYPE || 'authorization_code',
        clientId: process.env.BUFFER_CLIENT_ID || 'demo_client_id',
        clientSecret: process.env.BUFFER_CLIENT_SECRET || 'demo_client_secret',
        mockMode: process.env.BUFFER_MOCK_MODE === 'true',
        sdkMockMode: process.env.BUFFER_SDK_MOCK_MODE === 'true'
    }
};

export default Properties;