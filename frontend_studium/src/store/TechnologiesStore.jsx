import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { projectApi } from "../api/project"

export const useTechnologiesStore = create()(persist((set, get) => ({
    technologies: [],

    fetchTechnologies: async (currentUser) => {
        if(get().technologies.length > 0) return
        
        try {
            const data = await projectApi.fetchTechnologies()

            set({
                technologies: data,
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}),
    {
        name: 'technologies-storage',
        storage: createJSONStorage(() => localStorage),
    }
))