/**
 * Production Environment Configuration
 * 
 * apiBaseUrl: In production, this could be:
 *   - '/api' if your production server has a reverse proxy/gateway
 *   - 'https://api.yourdomain.com' for direct API Gateway URL
 * 
 * gatewayUrl: Direct gateway URL (adjust for your production setup)
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api',  // Assumes production has reverse proxy or API Gateway at same domain
  gatewayUrl: 'https://your-production-gateway.com'  // Replace with actual production URL
};
