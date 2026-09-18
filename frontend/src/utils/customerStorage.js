export function getCustomerStorageKey(key) {
    const email = sessionStorage.getItem("email") || localStorage.getItem("email") || "guest";
    const account = encodeURIComponent(email.trim().toLowerCase());
    return `${key}:${account}`;
}

export function readCustomerStorage(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(getCustomerStorageKey(key)) || "null");
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

export function writeCustomerStorage(key, value) {
    localStorage.setItem(getCustomerStorageKey(key), JSON.stringify(value));
}
