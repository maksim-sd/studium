import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FormatDate } from "../shared/FormatDate"

function ResponseCard ({ data, isSelected, onSelect }) {
    const navigate = useNavigate()
    const [buttonState, setButtonState] = useState(false)

    const toggle = () => {
        onSelect(data.id, !isSelected)
    }

    return (
        <div className="bg-white outline outline-gray-300 rounded-md max-w-173.75 p-6.25">
            <div className="flex gap-16.25 mb-7.5">
                <div className="bg-gray-500 w-24.75 h-24.75 rounded-full content-center text-center">
                    фото
                </div>
                <div className="pt-6.25">
                    <div className="text-[18px] font-bold cursor-pointer">
                        <a href="/profile" className="cursor-pointer">
                            {data?.executor.last_name} {data?.executor.first_name}
                        </a>
                    </div>
                    <div className="text-sm pt-2.5 text-gray-500">
                        Рейтинг пользователя: 5 ⭐
                    </div>
                </div>
            </div>
            <div className="flex gap-2.5 text-sm border-b border-gray-400 pb-2.5">
                <div className="basis-1/4 text-gray-500">
                    Текст отклика:
                </div>
                <div className="basis-3/4 min-h-17.75">
                    {data?.comment}
                </div>
            </div>
            <div className="flex gap-2.5 text-sm mt-2.5">
                <div className="basis-1/4 text-gray-500">
                    Откликнулся:
                </div>
                <div className="basis-3/4">
                    {FormatDate(data?.created_at)}
                </div>
            </div>
            <div className="mt-6.25 flex gap-7.5 justify-end items-center">
                <a href={`/profile/${data.executor.id}`} className="text-sm underline hover:font-medium hidden md:block">
                    Посмотреть профиль
                </a>
                {/* <div className="bg-gray-500 px-5 py-3.75 hover:bg-gray-600 cursor-pointer" onClick={toggle}>
                        Назначить исполнителем
                </div> */}
                <div className={`px-5 py-3 rounded-md cursor-pointer border-3 ${isSelected ? 'bg-white border-green-700' : 'bg-green-700 hover:bg-green-800 text-white border-transparent'}`} onClick={toggle}>
                    {isSelected ? 'Выбран исполнителем' : 'Выбрать исполнителем'}
                </div>
            </div>
        </div>
    )
}

export default ResponseCard