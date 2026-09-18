/**
 * Extracts a clear, user-friendly error message from Axios errors.
 * Accurately distinguishes between connection failures, 404 endpoints,
 * server errors, and API validation messages.
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback

  // Network or connection errors (CORS blocked, backend server down, DNS error)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Unable to reach backend server. Please check your internet connection or verify the backend service is running.'
    }
    return error.message || 'Unable to connect to backend server. Please check your connection.'
  }

  const { status, data } = error.response

  // Endpoint does not exist (e.g. wrong backend base URL)
  if (status === 404) {
    return 'API endpoint not found (404). Please verify that the backend server URL is configured correctly.'
  }

  // Gateway / server down errors
  if (status === 502 || status === 503 || status === 504) {
    return `Backend service unavailable (${status}). Please try again shortly.`
  }

  // Server-side crash
  if (status >= 500) {
    return data?.message || 'Server error occurred (500). Please try again later.'
  }

  // Return specific API error response message if provided
  if (data?.message) {
    return data.message
  }

  if (typeof data === 'string' && data.length < 150) {
    return data
  }

  return fallback
}
