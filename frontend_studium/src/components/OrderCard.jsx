import { useState } from "react"

function OrderCard () {
    const [isOpenDetails, setIsOpenDetails] = useState(false)

    return (
        <div className="outline outline-gray-300 rounded-md p-6.25">
            <div className="flex flex-col">
                <div className="flex justify-between items-center pb-5 md:pb-4">
                    <div className="text-sm text-center text-gray-600">
                        Заказ от 01.01.1999
                    </div>
                    <div className="outline outline-green-500 px-3 py-1 rounded-md">
                        Получен
                    </div>
                </div>
                <div className="flex gap-5 md:justify-between flex-col-reverse md:flex-row">
                    <div onClick={() => setIsOpenDetails(!isOpenDetails)} className="cursor-pointer">
                        { isOpenDetails ? 'Скрыть' : 'Показать' } детали заказа <span className="text-2xl text-green-700 hover:text-green-800">{ isOpenDetails ? '▲' : '▼' }</span>
                    </div>
                    <div className="flex gap-3 md:self-center self-start text-base">
                        <div className="font-semibold">
                            Итоговая сумма заказа:
                            </div>
                        <div className="">
                            $$$
                        </div>
                    </div>
                </div>
                <div className={` ${ isOpenDetails ? '' : 'hidden'}`}>
                    <div className="border-t border-t-gray-200 pt-5 mt-6.25">
                        <div className="flex">
                            <div className="w-full md:basis-3/5 flex flex-col gap-5">
                                <div className="flex justify-between">
                                    <div className="flex gap-5 items-center">
                                        <div className="bg-gray-200 h-15 w-15 rounded-full flex items-center justify-center">
                                            photo
                                        </div>
                                        <div className="">
                                            Название товара
                                        </div>
                                    </div>
                                    <div className="flex gap-5 md:gap-50 items-center">
                                        <div className="">
                                            1 шт.
                                        </div>
                                        <div className="">
                                            $$$ 
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex gap-5 items-center">
                                        <div className="bg-gray-200 h-15 w-15 rounded-full flex items-center justify-center">
                                            photo
                                        </div>
                                        <div className="">
                                            Название товара
                                        </div>
                                    </div>
                                    <div className="flex gap-5 md:gap-50 items-center">
                                        <div className="">
                                            1 шт.
                                        </div>
                                        <div className="">
                                            $$$
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex gap-5 items-center">
                                        <div className="bg-gray-200 h-15 w-15 rounded-full flex items-center justify-center">
                                            photo
                                        </div>
                                        <div className="">
                                            Название товара
                                        </div>
                                    </div>
                                    <div className="flex gap-5 md:gap-50 items-center">
                                        <div className="">
                                            1 шт.
                                        </div>
                                        <div className="">
                                            $$$ 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderCard