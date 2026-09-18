/**
 * Centralized Environment Configuration
 * Reads from Vite environment variables (import.meta.env)
 * with robust fallbacks for local and production setups.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5Xv8eZ4Q9X0123'

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || 'Obsidian Luxury'

export const APP_ENV =
  import.meta.env.VITE_APP_ENV || 'development'

export default {
  API_BASE_URL,
  RAZORPAY_KEY_ID,
  APP_NAME,
  APP_ENV,
}
