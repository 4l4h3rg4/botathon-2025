const API_BASE_URL = "http://localhost:8000/api/v1";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // Get token from localStorage if available (client-side only)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        // Handle 401 Unauthorized globally
        if (res.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
            window.location.href = "/login";
        }
        throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
}

export const api = {
    auth: {
        login: (data: any) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),
        register: (data: any) => fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),
        refresh: (token: string) => fetchAPI("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: token }) }),
    },
    volunteers: {
        list: (params?: any) => {
            const searchParams = new URLSearchParams(params);
            return fetchAPI(`/voluntarios/?${searchParams.toString()}`);
        },
        get: (id: string) => fetchAPI(`/voluntarios/${id}`),
        create: (data: any) => fetchAPI("/voluntarios/", { method: "POST", body: JSON.stringify(data) }),
        update: (id: string, data: any) => fetchAPI(`/voluntarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    },
    metrics: {
        overview: () => fetchAPI("/metrics/overview"),
        regions: () => fetchAPI("/metrics/regions"),
        skills: () => fetchAPI("/metrics/skills"),
        timeline: () => fetchAPI("/metrics/timeline"),
    },
    logs: {
        list: (params?: any) => {
            const searchParams = new URLSearchParams(params);
            return fetchAPI(`/logs/?${searchParams.toString()}`);
        }
    },
    segmentation: {
        create: (filters: any) => fetchAPI("/segmentation/", { method: "POST", body: JSON.stringify(filters) }),
        get: (id: string) => fetchAPI(`/segmentation/${id}`),
        list: () => fetchAPI("/segmentation/"),
    },
    communications: {
        simulate: (data: any) => fetchAPI("/communications/simular", { method: "POST", body: JSON.stringify(data) }),
        send: (data: any) => fetchAPI("/communications/enviar", { method: "POST", body: JSON.stringify(data) }),
    },
    config: {
        get: () => fetchAPI("/config/"),
        update: (data: any) => fetchAPI("/config/", { method: "POST", body: JSON.stringify(data) }),
    },
    notifications: {
        list: () => fetchAPI("/notifications/"),
        markRead: (id: string) => fetchAPI(`/notifications/${id}/read`, { method: "PATCH" }),
        markAllRead: () => fetchAPI("/notifications/mark-all-read", { method: "POST" }),
    },
};
