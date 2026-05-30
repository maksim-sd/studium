import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { projectApi } from "../api/project"

export const useProjectCategoryStore = create()(persist((set, get) => ({
    categories: [],

    fetchCategories: async (currentUser) => {
        if (get().categories.length > 0) return

        try {
            const data = await projectApi.fetchCategories()

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
        name: 'project-categories-storage',
        storage: createJSONStorage(() => localStorage),
    }
))