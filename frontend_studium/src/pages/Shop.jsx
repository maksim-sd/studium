import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { useUserStore } from "../store/UserStore"
import { useProductCategoryStore } from "../store/ProductCategoryStore"
import { cartApi } from "../api/cart"
import { shopApi } from "../api/shop"
import { useCartStore } from "../store/CartStore"
import { toast } from "react-toastify"
import ProductCard from '../components/ProductCard'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function ConfirmationModal ({onClose}) {
    const cart = useCartStore((state) => state.cart)
    const incrementItem = useCartStore((state) => state.incrementItem)
    const decrementItem = useCartStore((state) => state.decrementItem)

    const handleDecrease = async (productId) => {
        await decrementItem(productId)
    }

    const handleIncrease = async (productId) => {
        await incrementItem(productId)
    }

    const handleCreateOrder = async (cart) => {
        const payload = {
            cart_product_id: cart.map(item => Number(item.product_id))
        }

        await shopApi.fetchCreateOrder(payload)

        toast.success("Заказ успешно оформлен!")

        onClose()
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[90%] md:w-[30%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex bg-white rounded-md flex-col gap-4 md:gap-6.25">
                    <div className="flex flex-col justify-between">
                        <div onClick={onClose} className="self-end hover:font-bold cursor-pointer">
                            ✖
                        </div>
                        <div className="text-lg self-center font-bold">
                            Корзина
                        </div>
                    </div>
                    {cart.length > 0 ? (
                        <div className="">
                            {cart.map((item) => (
                                <div className="flex border-b justify-between border-gray-300 py-3 md:py-5 items-center">
                                    <div className="flex gap-2.5 items-center">
                                        <div className="bg-gray-200 rounded-full px-2.5 py-5.5">
                                            photo
                                        </div>
                                        <div className="">
                                            {item.product_id}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div 
                                            className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full"
                                            onClick={() => handleDecrease(item.product_id)}
                                        >
                                            –
                                        </div>
                                        <div className="text-xl">
                                            {item.quantity}
                                        </div>
                                        <div 
                                            className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full"
                                            onClick={() => handleIncrease(item.product_id)}
                                        >
                                            +
                                        </div>
                                    </div>
                                    <div className="text-nowrap pl-5">
                                        $ 0
                                </div>
                            </div>
                        ))}
                            <div className="py-2.5 font-bold text-base">
                                Итоговая стоимость заказа: $ 0
                            </div>
                            <div 
                                className="text-center cursor-pointer text-base md:text-lg self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-7 py-1.5 rounded-md" 
                                onClick={() => handleCreateOrder(cart)}
                            >
                                Оформить заказ
                            </div>
                        </div>
                        ) : (
                            <div className="text-center">
                                Пусто
                            </div>
                        )}
                </div>
            </div>
        </div>
    )   
}

function Shop() {
    const navigate = useNavigate()
    const user = useUserStore((state) => state.currentUser)

    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [products, setProducts] = useState([])
    const [balance, setBalance] = useState(0)

    const fetchCart = useCartStore((state) => state.fetchCart)

    const [isLoading, setIsLoading] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeModal = () => {
        setIsModalOpen(false)
    }

    useEffect(() => {
        async function fetchBalance() {
            const response = await fetch('/api/user/balance/', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${user}`,
                }
            })
            if (response.ok) {
                const data = await response.json()
                setBalance(data.number_of_points)
            }
        }

        async function fetchProducts() {
            setIsLoading(true)
            try {
                const [responseCategories, responseProducts] = await Promise.all([
                    shopApi.fetchCategories(), 
                    shopApi.fetchProducts(),
                    fetchCart(),
                ])
                setCategories(responseCategories)
                setProducts(responseProducts)
            } catch (error) {
                console.error('Ошибка при получении данных')
            }
            setIsLoading(false)
        }

        fetchBalance()
        fetchProducts()
    }, [])

    const handleCategoryChange = async (category) => {
        if (category === selectedCategory) {
            setSelectedCategory(null)

            setIsLoading(true)
            const data = await shopApi.fetchProducts()
            setProducts(data)

            setIsLoading(false)
        } else {
            setSelectedCategory(category)
            setIsLoading(true)

            const data = await shopApi.fetchProductsByCategory(category)
            setProducts(data)

            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mx-5 md:mx-62.5 mb-5">
                <div className="flex flex-col md:flex-row justify-between md:items-center pb-7 md:pb-10">
                    <div className="flex gap-7.5 items-center pb-7 md:pb-0">
                        <div className="font-bold text-2xl md:text-3xl">
                            Обмен внутренней валюты
                        </div>
                        <div className="text-2xl text-nowrap">
                            🪙 {balance}
                        </div>
                    </div>
                    <div className="flex flex-row-reverse self-start md:flex-row md:items-center gap-10">
                        <div 
                            onClick={() => navigate('/order-story')}
                            className="self-end box-border border-b-2 border-b-green-700 md:border-b-transparent hover:border-b-green-700 hover:border-b-2 cursor-pointer pb-3"
                        >
                            История заказов
                        </div>
                        <div 
                            onClick={() => setIsModalOpen(true)}
                            className="cursor-pointer px-7 py-1.5 text-lg rounded-md text-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900"
                        >
                            Корзина
                        </div>
                    </div>
                </div>
                {isLoading ? (
                    <div className="pb-5 w-full flex gap-2.5 flex-wrap">
                        {[1, 2, 3].map(i => (
                            <Skeleton height={30} width={130} />
                        ))}
                    </div>
                ) : (
                    <div className="pb-5 w-full flex gap-2.5 flex-wrap">
                        {categories.map((category) => (
                            <div className="relative block">
                                <input 
                                    type="radio" 
                                    name="category" 
                                    id={`category${category.id}`} 
                                    className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600"
                                    checked={selectedCategory === category.id}
                                    onClick={() => handleCategoryChange(category.id)}
                                />
                                <label htmlFor={`category${category.id}`} className="cursor-pointer px-3 md:px-3.5 py-1.5 rounded-[50px] font-normal inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                {isLoading ? (
                    <div className="grid md:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="border border-gray-200 rounded-md p-5">
                                <Skeleton width="100%" height={160}/>
                                <Skeleton count={2} width="100%" className="mt-6"/>
                                <Skeleton width="100%" height={39} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-4 gap-5">
                        {products.map((item) => (
                            <ProductCard item={item} />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && <ConfirmationModal onClose={closeModal}/>}

        </>
    )
}

export default Shop