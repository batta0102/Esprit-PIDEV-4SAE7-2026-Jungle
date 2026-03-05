/**
 * Environment Configuration
 * 
 * apiBaseUrl: Base path for all API calls (used with Angular proxy)
 * gatewayUrl: Direct gateway URL (for reference only, not used in proxy mode)
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api',
  gatewayUrl: 'http://localhost:8085'
};
