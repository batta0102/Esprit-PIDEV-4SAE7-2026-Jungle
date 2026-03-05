/**
 * URL Helper Utilities
 * Prevents double slashes and duplicate path segments in API URLs
 */

/**
 * Joins URL segments safely, removing duplicate slashes and path segments
 * 
 * @param base - Base URL or path (e.g., '/api' or 'http://localhost:8085/api')
 * @param paths - Path segments to join (e.g., 'resources', 'displayResources')
 * @returns Clean joined URL without duplicate slashes or segments
 * 
 * Examples:
 * joinUrl('/api', '/resources/displayResources') -> '/api/resources/displayResources'
 * joinUrl('/api', 'resources', 'displayResources') -> '/api/resources/displayResources'
 * joinUrl('/api/', '/api/resources') -> '/api/resources' (removes duplicate /api)
 */
export function joinUrl(base: string, ...paths: string[]): string {
  // Remove trailing slashes from base
  let url = base.replace(/\/+$/, '');
  
  for (const path of paths) {
    if (!path) continue;
    
    // Remove leading and trailing slashes from path
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!cleanPath) continue;
    
    // Check if this segment is already at the end of the URL (prevents /api/api)
    const segments = url.split('/').filter(Boolean);
    const pathSegments = cleanPath.split('/').filter(Boolean);
    
    // If the last segments of url match the first segments of path, skip them
    let skipCount = 0;
    for (let i = 0; i < pathSegments.length && i < segments.length; i++) {
      if (segments[segments.length - i - 1] === pathSegments[i]) {
        skipCount = i + 1;
      } else {
        break;
      }
    }
    
    if (skipCount > 0) {
      // Remove duplicate segments
      const uniqueSegments = pathSegments.slice(skipCount);
      if (uniqueSegments.length > 0) {
        url += '/' + uniqueSegments.join('/');
      }
    } else {
      url += '/' + cleanPath;
    }
  }
  
  // Clean up any remaining double slashes
  url = url.replace(/([^:]\/)\/+/g, '$1');
  
  return url;
}

/**
 * Builds an API URL using environment base URL and path segments
 * 
 * @param apiBase - API base URL from environment (e.g., '/api')
 * @param paths - Path segments (e.g., 'resources', 'displayResources')
 * @returns Complete API URL
 * 
 * Example:
 * buildApiUrl('/api', 'resources', 'displayResources') -> '/api/resources/displayResources'
 */
export function buildApiUrl(apiBase: string, ...paths: string[]): string {
  return joinUrl(apiBase, ...paths);
}
