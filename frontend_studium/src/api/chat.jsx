import { apiFetch } from "./fetch";

const BASE_URL = '/api/project_exchange/'

export const chatApi = {
    // Чаты текущего пользователя
    fetchChats: () => {
        return apiFetch(`${BASE_URL}user/chats/`, {
            method: 'GET',
        })
    }, 

    // Сообщения выбранного чата
    fetchMessages: (chatId) => {
        return apiFetch(`${BASE_URL}user/chat/${chatId}/messages/`, {
            method: 'GET',
        })
    },

    // Отправить сообщение
    fetchSendMessages: (chatId, message) => {
        return apiFetch(`${BASE_URL}chat/${chatId}/message/`, {
            method: 'POST',
            body: message
        })
    },

    // Обновить выбранное сообщение
    fetchUpdateMessages: (messageId, message) => {
        return apiFetch(`${BASE_URL}chat/message/${messageId}`, {
            method: 'PUT',
            body: message
        })
    },

    // Удалить свое сообщение для всех
    fetchDeleteMessages: (messageId) => {
        return apiFetch(`${BASE_URL}chat/message/${messageId}/`, {
            method: 'DELETE'
        })
    }
}