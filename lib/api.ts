const API_BASE_URL = "http://localhost:8000/api/v1";

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
}

export const api = {
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
        create: (data: any) => fetchAPI("/segmentation/", { method: "POST", body: JSON.stringify(data) }),
        get: (id: string) => fetchAPI(`/segmentation/${id}`),
    },
    communications: {
        simulate: (data: any) => fetchAPI("/comunicaciones/simular", { method: "POST", body: JSON.stringify(data) }),
    }
};
