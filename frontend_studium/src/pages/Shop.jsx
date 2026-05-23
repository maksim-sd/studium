import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

function ConfirmationModal ({onClose}) {
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
                    <div className="">
                        <div className="flex border-b justify-between border-gray-300 py-3 md:py-5 items-center">
                            <div className="flex gap-2.5 items-center">
                                <div className="bg-gray-200 rounded-full px-2.5 py-5.5">
                                    photo
                                </div>
                                <div className="">
                                    Наименование товара
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    –
                                </div>
                                <div className="text-xl">
                                    1
                                </div>
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    +
                                </div>
                            </div>
                            <div className="text-nowrap pl-5">
                                $ 0
                            </div>
                        </div>
                        <div className="flex border-b justify-between border-gray-300 py-3 md:py-5 items-center">
                            <div className="flex gap-2.5 items-center">
                                <div className="bg-gray-200 rounded-full px-2.5 py-5.5">
                                    photo
                                </div>
                                <div className="">
                                    Наименование товара
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    –
                                </div>
                                <div className="text-xl">
                                    1
                                </div>
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    +
                                </div>
                            </div>
                            <div className="text-nowrap pl-5">
                                $ 0
                            </div>
                        </div>
                        <div className="flex border-b justify-between border-gray-300 py-3 md:py-5 items-center">
                            <div className="flex gap-2.5 items-center">
                                <div className="bg-gray-200 rounded-full px-2.5 py-5.5">
                                    photo
                                </div>
                                <div className="">
                                    Наименование товара
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    –
                                </div>
                                <div className="text-xl">
                                    1
                                </div>
                                <div className="cursor-pointer px-2.25 py-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full">
                                    +
                                </div>
                            </div>
                            <div className="text-nowrap pl-5">
                                $ 0
                            </div>
                        </div>
                    </div>
                    <div className="py-2.5 font-bold text-base">
                        Итоговая стоимость заказа: $ 0
                    </div>
                    <div className="cursor-pointer text-base md:text-lg self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-7 py-1.5 rounded-md" onClick={onClose}>
                        Оформить заказ
                    </div>
                </div>
            </div>
            
        </div>
    )   
}

function Shop() {
    const navigate = useNavigate()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const technologies = [
        'Одежда',
        'Канцелярия',
        'Учебная литература',
        'Электроника',
        'Кружки',
    ]

    return (
        <>
            <div className="mx-5 md:mx-62.5 mb-5">
                <div className="flex flex-col md:flex-row justify-between md:items-center pb-7 md:pb-10">
                    <div className="flex gap-7.5 items-center pb-7 md:pb-0">
                        <div className="font-bold text-2xl md:text-3xl">
                            Обмен внутренней валюты
                        </div>
                        <div className="text-2xl text-nowrap">
                            $ 0
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
                <div className="pb-5 w-full flex gap-2.5 flex-wrap">
                    {technologies.map((technology, index) => (
                        <div className="relative block">
                            <input type="checkbox" name="technology" id={`technology${index}`} className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" />
                            <label htmlFor={`technology${index}`} className="cursor-pointer px-3 md:px-3.5 py-1.5 rounded-[50px] font-normal inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
                                {technology}
                            </label>
                        </div>
                    ))}
                </div>
                <div className="grid md:grid-cols-4 gap-5">
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                </div>
            </div>

            {isModalOpen && <ConfirmationModal onClose={closeModal}/>}

        </>
    )
}

export default Shop