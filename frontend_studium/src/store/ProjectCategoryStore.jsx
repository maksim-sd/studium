import { create } from "zustand"
import { projectApi } from "../api/project"

export const useProjectCategoryStore = create((set, get) => ({
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
            return false
        }
    }
}))
