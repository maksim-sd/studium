import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useUserStore = create()(persist((set) => ({
    isAuth: false,
    currentUser: null,
    currentUserData: [],


    logoutUser: () => set({
        isAuth: false,
        currentUser: null,
        currentUserData: [],
    }),

    fetchUser: async (credentials) => {
        try {
            const response = await fetch (`/api/user/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch user!')
            }

            const data = await response.json()

            set({
                isAuth: true,
                currentUser: credentials,
                currentUserData: data,
            })

            return true
        } catch (error) {
            console.log(error)

            return false
        }
    }
}),
    {
        name: 'user-storage',
        getStorage: () => localStorage,
    }
))