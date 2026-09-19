export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (!error) {
        return fallback;
    }

    // Backend returned a plain string
    if (typeof error.response?.data === "string") {
        return error.response.data;
    }

    // Backend returned { message: "..." }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Backend returned { error: "..." }
    if (error.response?.data?.error) {
        return error.response.data.error;
    }

    // HTTP status-based messages
    switch (error.response?.status) {
        case 400:
            return "Invalid request. Please check your details and try again.";

        case 401:
            return "Your session has expired. Please login again.";

        case 403:
            return "You are not authorized to perform this action.";

        case 404:
            return "The requested information was not found.";

        case 409:
            return "This action cannot be completed because the data already exists or conflicts with another request.";

        case 422:
            return "Some of the information provided is invalid.";

        case 500:
            return "Something went wrong on the server. Please try again later.";

        default:
            break;
    }

    // Network/server unavailable
    if (!error.response) {
        return "Unable to connect to the server. Please check your connection and try again.";
    }

    return fallback;
};