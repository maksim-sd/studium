import { apiFetch } from "./fetch"

const BASE_URL = '/api/user/'

export const requestApi = {
    // Обращения текущего пользователя
    fetchRequests: () => {
        return apiFetch(`${BASE_URL}requests/`, {
            method: 'GET',
        })
    },

    // Создать обращение
    fetchPostRequest: (message) => {
        return apiFetch(`${BASE_URL}request/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: message }) 
        })
    }
}