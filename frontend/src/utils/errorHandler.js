/**
 * Standardized error message extractor for ShopStack Frontend
 * Handles backend ApiErrorResponse, Axios errors, network timeouts, and strings
 */
export function extractErrorMessage(error, defaultMessage = "An unexpected error occurred. Please try again.") {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;

  // Axios HTTP Response Error
  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string' && data.trim()) {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
      if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        const firstKey = Object.keys(data.fieldErrors)[0];
        if (firstKey) {
          return `${firstKey}: ${data.fieldErrors[firstKey]}`;
        }
      }
      try {
        return JSON.stringify(data);
      } catch (e) {
        return defaultMessage;
      }
    }
    if (error.response.status === 404) return "Requested resource was not found.";
    if (error.response.status === 401) return "Unauthorized access. Please log in again.";
    if (error.response.status === 403) return "Access forbidden. You do not have permission for this action.";
    if (error.response.status === 409) return "Conflict detected. The operation conflicts with existing server data.";
    if (error.response.status === 500) return "Internal server error. Please try again shortly.";
  }

  // Network / Connection Error
  if (error.request && !error.response) {
    return "Network error: Unable to communicate with the ShopStack server. Please check your network connection.";
  }

  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return defaultMessage;
}
