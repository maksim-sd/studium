import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useTechnologiesStore = create()(persist((set) => ({
    technologies: [],

    fetchTechnologies: async (currentUser) => {
        try {
            const response = await fetch (`/api/project_exchange/technologies/`, {
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
        getStorage: () => localStorage,
    }
))