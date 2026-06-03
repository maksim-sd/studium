import { apiFetch } from "./fetch";

const BASE_URL = '/api/shop/cart/'

export const cartApi = {
    // Корзина пользователя
    fetchCart: () => {
        return apiFetch(`${BASE_URL}`, {
            method: 'GET'
        })
    },

    // Добваить товар в корзину
    fetchAddToCart: (productId) => {
        return apiFetch(`${BASE_URL}product/${productId}/`, {
            method: 'POST'
        })
    },

    // Удалить товар из корзины
    fetchDeleteFromCart: (productId) => {
        return apiFetch(`${BASE_URL}product/${productId}/`, {
            method: 'DELETE'
        })
    },

    // Увеличить количество товара на 1
    fetchIncrease: (productId) => {
        return apiFetch(`${BASE_URL}product/${productId}/increase/`, {
            method: 'PATCH'
        })
    },

    // Ученьшить количество товара на 1
    fetchDecrease: (productId) => {
        return apiFetch(`${BASE_URL}product/${productId}/decrease/`, {
            method: 'PATCH'
        })
    },
}