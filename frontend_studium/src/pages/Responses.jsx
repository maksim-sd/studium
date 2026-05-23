import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import ResponseCard from "../components/ResponseCard"

function ConfirmationModal ({onClose}) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const closeModal = () => setIsModalOpen(false)

    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[35%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex bg-white rounded-md flex-col gap-6.25">
                    <div className="flex flex-col justify-between">
                        <div onClick={onClose} className="self-end hover:font-bold cursor-pointer">
                            ✖
                        </div>
                        <div className="text-lg self-center">
                            Отлично!
                        </div>
                    </div>
                    <div className="">
                        [Имена пользователей] были назначены исполнителями для данной задачи.
                    </div>
                    <div className="text-gray-500 text-sm">
                        Задача теперь будет отображаться в профиле в разделе "Текущие проекты". Теперь доступен чат между всеми участниками проекта.
                    </div>
                    <div className="cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={onClose}>
                        Понятно
                    </div>
                </div>
            </div>
            
        </div>
    )   
}

function Responses () {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    // const closeModal = () => setIsModalOpen(false)

    const closeModal = () => {
        setIsModalOpen(false)
        navigate('/profile')
    }

    return (
        <>
        <div className="mx-5 md:mx-62.5">
            <div className="text-2xl md:text-3xl font-bold">
                Отклики к задаче Разработка программного приложения
                <div className="font-normal text-lg md:text-xl pt-3.75 mb-10 text-black">
                    Выберите студентов, которых готовы назначить исполнителями 
                </div>
            </div>
            <div className="grid 2xl:grid-cols-2 gap-5 md:gap-7.5 xl:grid-cols-1 pb-7">
                <ResponseCard />
                <ResponseCard />
                <ResponseCard />
            </div>
            <div className="mx-auto w-max pb-5">
                <div 
                    className="px-9 py-3 cursor-pointer rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-base md:text-lg font-bold"
                    onClick={() => setIsModalOpen(true)}
                >
                    Утвердить исполнителей
                </div>
            </div>
        </div>

        {isModalOpen && <ConfirmationModal onClose={closeModal}/>}

        </>
    )
}

export default Responses