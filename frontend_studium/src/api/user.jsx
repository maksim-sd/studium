import { apiFetch } from "./fetch"

const BASE_URL = '/api/user/'

export const userApi = {
    // Профиль текущего пользователя
    fetchUser: (credentials) => {
        return apiFetch(`${BASE_URL}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`
            },
            withAuth: false
        })
    },

    // Профиль выбранного пользователя
    fetchChosenUser: (userId) => {
        return apiFetch(`${BASE_URL}${userId}/`, {
            method: 'GET',
        })
    },    

    // Все группы пользователей
    fetchGroups: () => {
        return apiFetch(`${BASE_URL}groups/`,  {
            method: 'GET'
        })
    },

    // Все организации
    fetchOrganizations: () => {
        return apiFetch(`${BASE_URL}organizations/`, {
            method: 'GET'
        })
    },

    // Баланс текущего пользователя
    fetchBalance: () => {
        return apiFetch(`${BASE_URL}balance/`, {
            method: 'GET'
        })
    },

    // API фото
    fetchUserPhoto: (photo) => {
        return apiFetch(`${BASE_URL}photo/`, {
            method: "POST",
            'accept': '*/*',
            body: photo,
        })
    }
}