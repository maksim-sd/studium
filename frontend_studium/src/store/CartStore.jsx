import { create } from "zustand"
import { persist } from "zustand/middleware"
import { cartApi } from "../api/cart"

export const useCartStore = create((set, get) => ({
    cart: [],

    fetchCart: async () => {
        if(get().cart.length > 0) return

        try {
            const data = await cartApi.fetchCart()

            set({
                cart: data
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }, 

    addItem: async (productId) => {
        try {
            const data = await cartApi.fetchAddToCart(productId)

            const actualData = await cartApi.fetchCart()

            set({
                cart: actualData,
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }, 

    removeItem: async (productId) => {
        try {
            const data = await cartApi.fetchDeleteFromCart(productId)

            const actualData = await cartApi.fetchCart()

            set({
                cart: actualData, 
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }, 

    incrementItem: async (productId) => {
        try {
            await cartApi.fetchIncrease(productId)

            const updatedCart = get().cart.map(item => 
                item.product_id === productId ? { ...item, quantity: item.quantity + 1} : item
            )

            set({
                cart: updatedCart
            })

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }, 

    decrementItem: async (productId) => {
        const product = get().cart.find(item => item.product_id === productId)

        if(product.quantity === 1) {
            get().removeItem(productId)
        } else {
            try {
                await cartApi.fetchDecrease(productId)

                const updatedCart = get().cart.map(item => 
                    item.product_id === productId ? { ...item, quantity: item.quantity - 1} : item
                )

                set({
                    cart: updatedCart
                })

                return true
            } catch (error) {
                console.log(error)
                return false
            }
        }
    }, 
}),
    {
        name: 'cart-storage',
    }
)