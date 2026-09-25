const API_BASE_URL = "https://localhost:7143/api";

async function getData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error("Request failed.");
    }

    return await response.json();
}


async function postData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.json();
}


async function putData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}


async function deleteData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }
}