import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useProductCategoryStore = create()(persist((set) => ({
    categories: [],

    fetchCategories: async (currentUser) => {
        try {
            const response = await fetch (`/api/shop/categories/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${currentUser}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch product categories!')
            }

            const data = await response.json()

            console.log(data)

            set({
                categories: data,
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}),
    {
        name: 'product-categories-storage',
        getStorage: () => localStorage,
    }
))