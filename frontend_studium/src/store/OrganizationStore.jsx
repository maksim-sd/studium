import { create } from "zustand"
import { userApi } from "../api/user"

export const useOrganizationStore = create((set, get) => ({
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
            return false
        }
    }
}))
