import { create } from "zustand"

export const useProductCategoryStore = create((set, get) => ({
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
            return false
        }
    }
}))
