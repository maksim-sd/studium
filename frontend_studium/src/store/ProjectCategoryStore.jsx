import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useProjectCategoryStore = create()(persist((set) => ({
    categories: [],

    fetchCategories: async (currentUser) => {
        try {
            const response = await fetch (`/api/project_exchange/categories/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${currentUser}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch tags!')
            }

            const data = await response.json()

            set({
                categories: data,
            })

            console.log(categories)

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}),
    {
        name: 'project-categories-storage',
        getStorage: () => localStorage,
    }
))