import { create } from "zustand"
import { projectApi } from "../api/project"

export const useTechnologiesStore = create((set, get) => ({
    technologies: [],

    fetchTechnologies: async (currentUser) => {
        if (get().technologies.length > 0) return

        try {
            const data = await projectApi.fetchTechnologies()

            set({
                technologies: data,
            })

            return true
        } catch (error) {
            return false
        }
    }
}))
