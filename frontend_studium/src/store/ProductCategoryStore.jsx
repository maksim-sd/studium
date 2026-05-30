import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const useProductCategoryStore = create()(persist((set, get) => ({
    categories: [],

    fetchCategories: async (currentUser) => {
        if (get().categories.length > 0) return

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
        storage: createJSONStorage(() => localStorage),
    }
))