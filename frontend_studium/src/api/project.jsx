import { apiFetch } from "./fetch"

const BASE_URL = '/api/project_exchange/'

export const projectApi = {
    // Категории проекта
    fetchCategories: () => {
        return apiFetch(`${BASE_URL}categories/`, {
            method: 'GET',
        })
    }, 

    // Технологии
    fetchTechnologies: () => {
        return apiFetch(`${BASE_URL}technologies/`, {
            method: 'GET',
        })
    }, 

    // Типы проекта
    fetchProjectTypes: () => {
        return apiFetch(`${BASE_URL}types/`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            }
        })
    }, 

    // Список доступных проектов
    fetchProjects: (params) => {
        return apiFetch(`${BASE_URL}?${params}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            }
        })
    },

    // Создать проект
    fetchPostProjects: (formData) => {
        return apiFetch(`${BASE_URL}`, {
            method: 'POST',
            body: formData,
        })
    },

    // Проекты, на которые откликнулся текущий пользователь
    fetchResponsedProjects: () => {
        return apiFetch(`${BASE_URL}responses/`, {
            method: 'GET',
        })
    },

    // Проекты, требующие модерации
    fetchModerateProjects: () => {
        return apiFetch(`${BASE_URL}moderation/`, {
            method: 'GET',
        })
    },

    // Проекты, в которых участвует текущий пользователь
    fetchActiveProjects: () => {
        return apiFetch(`${BASE_URL}active/`, {
            method: 'GET',
        })
    },

    // Проекты, в которых участвует выбранный пользователь


    // Проекты, в которых участвовал текущий пользователь
    fetchArchivedProjects: () => {
        return apiFetch(`${BASE_URL}history/`, {
            method: 'GET',
        })
    },

    // Проекты, в которых участвовал выбранный пользователь

    // Подробнее о выбранном проекте
    fetchChosenProject: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/`, {
            method: 'GET',
        })
    }, 

    // Изменить выбранный проект
    fetchChangeProject: (projectId, formData) => {
        return apiFetch(`${BASE_URL}${projectId}/`, {
            method: 'PUT',
            body: formData,
        })
    },

    // Участники выбранного проекта
    fetchProjectParticipants: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/participants/`, {
            method: 'GET',
        })
    },

    // Опубликовать выбранный проект
    fetchPublishProject: (projectId, formData) => {
        return apiFetch(`${BASE_URL}${projectId}/publish/`, {
            method: 'PUT',
            body: formData,
        })
    }, 

    // Завершить выбранный проект
    fetchCompleteProject: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/complete/`, {
            method: 'POST',
        })
    },

    // Оставить отзыв исполнителю/исполнителям выбранного проекта
    fetchFeedback: (projectId, data) => {
        return apiFetch(`${BASE_URL}${projectId}/feedback/`, {
            method: 'POST', 
            body: data,
        })
    },

    // Отменить выбранный проект
    fetchCancelProject: (projectId) => {
        return apiFetch(`${BASE_URL}${projectId}/cancel/`, {
            method: 'POST',
        })
    }
}