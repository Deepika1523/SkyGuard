/**
 * SkyGuard AI — Shared REST API Client Wrapper
 */
const SkyGuardAPI = (function() {
    
    // Function to retrieve CSRF token from Django cookies
    function getCsrfToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        if (!cookieValue) {
            const input = document.querySelector('[name=csrfmiddlewaretoken]');
            if (input) cookieValue = input.value;
        }
        return cookieValue;
    }

    async function request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : (endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`);
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const csrf = getCsrfToken();
        if (csrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
            headers['X-CSRFToken'] = csrf;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errJson = await response.json();
                    errorDetails = errJson.detail || errJson.message || JSON.stringify(errJson);
                } catch (e) {}
                throw new Error(errorDetails);
            }
            if (response.status === 204) return null;
            const data = await response.json();
            if (data && typeof data === 'object' && Array.isArray(data.results)) {
                const arr = data.results;
                arr.count = data.count;
                arr.next = data.next;
                arr.previous = data.previous;
                return arr;
            }
            return data;
        } catch (err) {
            console.error(`SkyGuard API Error [${options.method || 'GET'} ${url}]:`, err);
            throw err;
        }
    }

    return {
        get: function(endpoint, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
            return request(fullPath, { method: 'GET' });
        },

        post: function(endpoint, data = {}) {
            return request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        patch: function(endpoint, data = {}) {
            return request(endpoint, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        },

        delete: function(endpoint) {
            return request(endpoint, { method: 'DELETE' });
        }
    };
})();
