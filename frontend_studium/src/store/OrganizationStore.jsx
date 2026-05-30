import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { userApi } from "../api/user"

export const useOrganizationStore = create()(persist((set, get) => ({
    organizations: [],

    fetchOrganizations: async (currentUser) => {
        if (get().organizations.length > 0) return

        try {
            const data = await userApi.fetchOrganizations()

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
        storage: createJSONStorage(() => localStorage),
    }
))