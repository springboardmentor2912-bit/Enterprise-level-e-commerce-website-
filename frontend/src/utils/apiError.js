export async function getApiErrorMessage(response, fallback) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) return "Please log in to continue.";
    if (response.status === 403) return "You don't have permission to access this page.";
    if (response.status === 409) return body.message || "Only the available stock can be ordered.";
    if (response.status >= 500) return "Server error. Please try again later.";
    return body.message || fallback;
}

export function paymentErrorMessage() {
    return "Payment failed. Please try again.";
}