import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useOrganizationStore = create()(persist((set) => ({
    organizations: [],

    fetchOrganizations: async (currentUser) => {
        try {
            const response = await fetch (`/api/user/organizations/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${currentUser}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch organizations!')
            }

            const data = await response.json()

            set({
                organizations: data,
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}),
    {
        name: 'project-organizations-storage',
        getStorage: () => localStorage,
    }
))