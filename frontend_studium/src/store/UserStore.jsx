import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const createUserGroupSlice = (set, get) => ({
    allGroups: [],
    groups: [],
    isLoading: false,

    fetchGroups: async () => {
        try {
            set({ isLoading: true })
            const { userApi } = await import('../api/user')
            const data = await userApi.fetchGroups()

            const userGroupId = get().currentUserData?.groups_id

            if (userGroupId && userGroupId.length > 0) {
                const userGroup = data.filter(group => userGroupId[0] === group.id)
                if (userGroup.length > 0) {
                    set({ allGroups: data, groups: userGroup[0].name, isLoading: false })
                }
            } else {
                set({ isLoading: false })
            }
            return true
        } catch (error) {
            console.log(error)
            set({ groups: userGroup[0].name, isLoading: false })
            return false
        }
    }
})

export const createUserSlice = (set, get) => ({
    isAuth: false,
    currentUser: null,
    currentUserData: [],
    isLoading: true,

    checkAuth: async () => {
        const storedData = localStorage.getItem('user-storage')
        
        if (!storedData) {
            set({ isLoading: false, isAuth: false })
            return false
        }

        try {
            const parsedData = JSON.parse(storedData)
            const { currentUser, currentUserData } = parsedData.state
            
            if (currentUser && currentUserData?.id) {
                const { userApi } = await import('../api/user')
                const isValid = await userApi.fetchUser(currentUser)
                
                if (isValid) {
                    set({ 
                        isAuth: true, 
                        currentUser, 
                        currentUserData,
                        isLoading: false 
                    })
                    if (!get().groups?.length) {
                        await get().fetchGroups()
                    }
                    return true
                }
            }
            
            set({ isLoading: false, isAuth: false })
            return false
        } catch (error) {
            console.log('Auth check failed:', error)
            set({ isLoading: false, isAuth: false })
            return false
        }
    },

    logoutUser: () => {
        set({
            isAuth: false,
            currentUser: null,
            currentUserData: [],
            isLoading: false,
        })
        set({ groups: [], allGroups: [] })
        localStorage.removeItem('user-storage')
    },

    fetchUser: async (credentials) => {
        set({ isLoading: true })
        try {
            const { userApi } = await import('../api/user')
            const data = await userApi.fetchUser(credentials)

            set({
                isAuth: true,
                currentUser: credentials,
                currentUserData: data,
                isLoading: false,
            })
            await get().fetchGroups()
            return true
        } catch (error) {
            console.log(error)
            set({ isLoading: false })
            return false
        }
    }, 

    updateUserPhoto: async (photo) => {
        try {
            const { userApi } = await import('../api/user')
            const response = await userApi.fetchUserPhoto(photo)

            const updatedUserData = await userApi.fetchUser(get().currentUser)

            set((state) => ({
                currentUserData: updatedUserData
            }))
        } catch (error) {
            console.log("failed update photo:", error)
            throw error
        }
    }
})

export const useUserStore = create()(persist((set, get, store) => ({
    ...createUserSlice(set, get, store),
    ...createUserGroupSlice(set, get, store),
}),
    {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
            isAuth: state.isAuth,
            currentUser: state.currentUser,
            currentUserData: state.currentUserData,
            groups: state.groups,
            allGroups: state.allGroups
        })
    }
))