import { useUserStore } from "../store/UserStore"

export const apiFetch = async (endpoint, options = {}) => {
    const { withAuth = true, ...fetchOptions } = options

    const headers = { ...fetchOptions.headers }

    if(!(fetchOptions.body instanceof FormData)) {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json'
        }
    }

    if (withAuth) {
        const credentials = useUserStore.getState().currentUser

        if (credentials) {
            headers['Authorization'] = `Basic ${credentials}`
        }
    }

    const config = {
        ...fetchOptions,
        headers,
    }

    const response = await fetch(`${endpoint}`, config)

    if (response.status === 401 && withAuth) {
        useUserStore.getState().logoutUser()
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const apiError = new Error("API error")
        apiError.status = response.status
        apiError.data = response.status === 422 ? errorData.detail : errorData
        throw apiError
    }

    if (response.status === 204) return null

    return response.json()
}