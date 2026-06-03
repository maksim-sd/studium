import { apiFetch } from "./fetch";

const BASE_URL = '/api/shop/'

export const shopApi = {
    // Категории товара
    fetchCategories: () => {
        return apiFetch(`${BASE_URL}categories/`, {
            method: 'GET'
        })
    }, 

    // Товары выбранной категории
    fetchProductsByCategory: (categoryId) => {
        return apiFetch(`${BASE_URL}category/${categoryId}/products/`, {
            method: 'GET'
        })
    }, 

    // Товары
    fetchProducts: () => {
        return apiFetch(`${BASE_URL}products/`, {
            method: 'GET'
        })
    }, 

    // Выбранный товар

    // Заказы текущего пользователя
    fetchOrders: () => {
        return apiFetch(`${BASE_URL}orders/`, {
            method: 'GET'
        })
    },

    // Детали выбранного заказа текущего пользователя
    fetchSpecificOrder: (orderId) => {
        return apiFetch(`${BASE_URL}order/${orderId}/`, {
            method: 'GET'
        })
    },

    //  Оформить заказ
    fetchCreateOrder: (cart) => {
        return apiFetch(`${BASE_URL}order/`, {
            method: 'POST', 
            body: cart,
        })
    },
}