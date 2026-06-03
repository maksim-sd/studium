import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { shopApi } from "../api/shop"
import OrderCard from "../components/OrderCard"
import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'

function OrdersPage () {
    const [activeTab, setActiveTab] = useState('tab1')
    const navigate = useNavigate()

    const [activeOrders, setActiveOrders] = useState([])
    const [finishedOrders, setFinishedOrders] = useState([])

    const [isLoading, setIsLoading] = useState(false)
    
    const tabs = [
        {id: 'actual-orders', label: 'Актуальные'},
        {id: 'done-orders', label: 'Завершенные'},
    ]
    
    const tabContent = {
        'actual-orders': (
            activeOrders.length > 0 ? (
                <div className="flex flex-col gap-5">
                    {activeOrders.map((order) => (
                        <OrderCard order={order} />
                    ))}
                </div>
            ) : (
                <div className="pt-10 flex flex-col gap-10 md:gap-5 items-center">
                    <div className="text-xl md:text-2xl text-center">
                        На данный момент у Вас нет актуальных заказов
                    </div>
                    <div className="">
                        <div onClick={() => navigate('/studium-store')} className="px-4 py-2 cursor-pointer text-sm md:text-lg rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 text-center text-white">
                            Вернуться в раздел с товарами
                        </div>
                    </div>
                </div>
            )
        ),
        'done-orders': (
            finishedOrders.length > 0 ? (
                <div className="flex flex-col gap-5">
                    {finishedOrders.map((order) => (
                        <OrderCard order={order} />
                    ))}
                </div>
            ) : (
                <div className="pt-10 flex flex-col gap-10 md:gap-5 items-center">
                    <div className="text-xl md:text-2xl text-center">
                        Здесь будут отображаться Ваши завершенные заказы
                    </div>
                    <div className="">
                        <div onClick={() => navigate('/studium-store')} className="px-4 py-2 cursor-pointer text-sm md:text-lg rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 text-center text-white">
                            Вернуться в раздел с товарами
                        </div>
                    </div>
                </div>
            )
        )
    }

    useEffect(() => {
        setActiveTab('actual-orders')

        async function fetchUserOrders() {
            setIsLoading(true)

            try {
                const data = await shopApi.fetchOrders()

                const filteredDataActive = data?.filter((order) => order.order_status === 'Оформлен')
                const filteredDataFinished = data?.filter((order) => order.order_status === 'Получен')
                setActiveOrders(filteredDataActive)
                setFinishedOrders(filteredDataFinished)
            } catch (error) {
                console.log(error)
            }
            setIsLoading(false)
        }

        fetchUserOrders()
    }, [])

    return (
        <div className="mx-5 md:mx-62.5">
            <div className="flex flex-col gap-5">
                <div className="text-2xl md:text-3xl font-bold mb-2 md:mb-5">
                    История заказов
                </div>
                <div className="flex justify-between border-b border-gray-300 w-full">
                    <div className="">
                        {tabs.map((tab) => (
                            <button key={tab.id}
                                className={`px-4 py-2 hover:text-green-600 font-medium cursor-pointer ${
                                    activeTab === tab.id ? "border-b-2 border-green-700 " : 'text-gray-500'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="px-4">
                    {isLoading ? (
                        <div className="flex flex-col gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border border-gray-300 rounded-md p-6.25">
                                    <Skeleton width='20%' height={14} className="mb-10" />
                                    <Skeleton width='100%' height={16} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        tabContent[activeTab]
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrdersPage