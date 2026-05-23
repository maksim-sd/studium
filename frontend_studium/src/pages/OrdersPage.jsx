import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import OrderCard from "../components/OrderCard"

function OrdersPage () {
    const [activeTab, setActiveTab] = useState('tab1')
    const navigate = useNavigate()
    
    const tabs = [
        {id: 'actual-orders', label: 'Актуальные'},
        {id: 'done-orders', label: 'Завершенные'},
    ]
    
    const tabContent = {
        'actual-orders': (
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
        ),
        'done-orders': (
            <div className="flex flex-col gap-5">
                <OrderCard />
                <OrderCard />
                <OrderCard />
            </div>
        )
    }

    useEffect(() => {
        setActiveTab('actual-orders');
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
                    {tabContent[activeTab]}
                </div>
            </div>
        </div>
    )
}

export default OrdersPage