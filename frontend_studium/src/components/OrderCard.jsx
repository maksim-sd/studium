import { useState } from "react"
import { FormatDate } from "../shared/FormatDate"
import { shopApi } from "../api/shop"

function OrderCard ({ order }) {
    const [isOpenDetails, setIsOpenDetails] = useState(false)
    const [orderDetail, setOrderDetail] = useState([])

    const handleClick = async (orderId) => {
        if (isOpenDetails) {
            setIsOpenDetails(false)
        } else {
            try {
                const data = await shopApi.fetchSpecificOrder(orderId)
                setOrderDetail(data)
            } catch (error) {
            }
            setIsOpenDetails(true)
        }
    }

    return (
        <div className="outline outline-gray-300 rounded-md p-6.25">
            <div className="flex flex-col">
                <div className="flex justify-between items-center pb-5 md:pb-4">
                    <div className="text-sm text-center text-gray-600">
                        Заказ от {FormatDate(order.created_at)}
                    </div>
                    <div className={`${order.order_status === 'Получен' ? "outline-green-500" : "outline-amber-600"} outline  px-3 py-1 rounded-md`}>
                        {order.order_status}
                    </div>
                </div>
                <div className="flex gap-5 md:justify-between flex-col-reverse md:flex-row">
                    <div onClick={() => handleClick(order.id)} className="cursor-pointer">
                        { isOpenDetails ? 'Скрыть' : 'Показать' } детали заказа <span className="text-2xl text-green-700 hover:text-green-800">{ isOpenDetails ? '▲' : '▼' }</span>
                    </div>
                    <div className="flex gap-3 md:self-center self-start text-base">
                        <div className="font-semibold">
                            Итоговая сумма заказа:
                            </div>
                        <div className="">
                           🪙 {order.total_amount}
                        </div>
                    </div>
                </div>
                <div className={` ${ isOpenDetails ? '' : 'hidden'}`}>
                    <div className="border-t border-t-gray-200 pt-5 mt-6.25">
                        <div className="flex">
                            <div className="w-full md:basis-3/5 flex flex-col gap-5">
                                {orderDetail.map((detail) => (
                                    <div className="flex justify-between">
                                        <div className="flex gap-5 items-center">
                                            <div className="bg-gray-200 h-15 w-15 rounded-full flex items-center justify-center">
                                                <img src={detail.product.photo} alt="" />
                                            </div>
                                            <div className="">
                                                {detail.product.name}
                                            </div>
                                        </div>
                                        <div className="flex gap-5 md:gap-50 items-center">
                                            <div className="">
                                                {detail.quantity} шт.
                                            </div>
                                            <div className="">
                                                🪙 {detail.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderCard