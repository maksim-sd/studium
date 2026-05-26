import { create } from "zustand"
import { persist } from "zustand/middleware"

export const createUserGroupSlice = (set, get) => ({
    groups: [],

    fetchGroups: async () => {
        try {
        const currentUser = get().currentUser

        if (!currentUser) throw new Error('No user authenticated');

            const response = await fetch(`/api/user/groups/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${currentUser}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch users groups!');
            }

            const data = await response.json()

            const userGroupId = get().currentUserData?.groups_id

            const userGroup = data.filter(group => userGroupId[0] === group.id)

            set({ groups: userGroup[0].name })

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
})

export const createUserSlice = (set, get) => ({
    isAuth: false,
    currentUser: null,
    currentUserData: [],

    logoutUser: () => set({
        isAuth: false,
        currentUser: null,
        currentUserData: [],
        groups: [], 
    }),

    fetchUser: async (credentials) => {
        try {
            const response = await fetch(`/api/user/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user!');
            }

            const data = await response.json();

            set({
                isAuth: true,
                currentUser: credentials,
                currentUserData: data,
            });

            await get().fetchGroups();

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
});

export const useUserStore = create()(persist((set, get, store) => ({
    ...createUserSlice(set, get, store),
    ...createUserGroupSlice(set, get, store),
}),
    {
        name: 'user-storage',
        getStorage: () => localStorage,
    }
))