/**
 * Helper utility to safely extract clean, user-friendly error messages from Axios error objects
 * across Spring Boot backend responses.
 */
export const getErrorMessage = (error, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallback;

  // 1. Direct message field from Spring Boot GlobalExceptionHandler format
  if (error.response?.data?.message && typeof error.response.data.message === 'string') {
    return error.response.data.message;
  }

  // 2. Error field (string)
  if (error.response?.data?.error && typeof error.response.data.error === 'string') {
    return error.response.data.error;
  }

  // 3. Validation errors map: { fieldName: "Error message" }
  if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
    const errorValues = Object.values(error.response.data.errors);
    if (errorValues.length > 0) {
      return errorValues.join(', ');
    }
  }

  // 4. Custom API error message string
  if (typeof error.response?.data === 'string' && error.response.data.trim().length > 0) {
    return error.response.data;
  }

  // 5. Standard JS error message (e.g. Network Error)
  if (error.message && typeof error.message === 'string') {
    if (error.message.toLowerCase().includes('network error')) {
      return 'Network error: Unable to connect to server. Please check your internet connection.';
    }
    return error.message;
  }

  return fallback;
};
