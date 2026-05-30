import { apiFetch } from "./fetch";

const BASE_URL = `/api/project_exchange/`

export const responseApi = {
    // Откликнуться на выбранный проект
    fetchResponse: (projectId, data) => {
        return apiFetch(`${BASE_URL}${projectId}/response/`, {
            method: 'POST',
            body: data,
        })
    },

    // Количество откликов на выбранный проект
    fetchResponseQuantity: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/response/quantity/`, {
            method: 'GET',
        })
    },

    // Все отклики на выбранный проект
    fetchAllResponses: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/responses/`, {
            method: 'GET',
        })
    },

    // Назначить исполнителей по выбранным откликам
    fetchAppoint: (projectId, responses) => {
        return apiFetch(`${BASE_URL}${projectId}/responses/appoint/`, {
            method: 'POST',
            body: responses,
        })
    },

    // Список исполнителей
    fetchExecutors: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/executors/`, {
            method: 'GET',
        })
    },

    // Список модераторов
     fetchModerators: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/moderators/`, {
            method: 'GET',
        })
    },

    // Добавить исполнителя или модератора
    fetchAddParticipant: (projectId, group, userId) => {
        return apiFetch(`${BASE_URL}${projectId}/${group}/${userId}/`, {
            method: 'POST',
        })
    },

    // Удалить участника
    fetchDeleteParticipant: (projectId, userId) => {
        return apiFetch(`${BASE_URL}${projectId}/user/${userId}/`, {
            method: 'DELETE',
        })
    },
}