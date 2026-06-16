import { useState, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom'
import { projectApi } from "../api/project"
import { responseApi } from "../api/response"
import { useUserStore } from "../store/UserStore"
import { toast } from "react-toastify"
import ResponseCard from "../components/ResponseCard"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css' 

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
                        Пользователи были назначены исполнителями для данной задачи.
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
    const user = useUserStore((state) => state.currentUser)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()
    const { taskId } = useParams()

    const [projectName, setProjectName] = useState('')
    const [responses, setRepsonses] = useState([])

    const [isLoading, setIsLoading] = useState(false)

    const closeModal = () => {
        setIsModalOpen(false)
        navigate('/profile')
    }

    const [selectedResponses, setSelectedResponses] = useState([])

    const handleSelect = (responseId, isSelected) => {
        if (isSelected) {
            setSelectedResponses([...selectedResponses, responseId])
        } else {
            setSelectedResponses(selectedResponses.filter(id => id !== responseId))
        }
    }

    const handleConfirm = async (e) => {
        if (e) {
            e.preventDefault()
        }

        if (selectedResponses.length === 0) {
            toast.error('Недопустимое количество исполнителей')
        } else {
            const payload = {
                responses_id: selectedResponses,
            }
            const response = await responseApi.fetchAppoint(taskId, JSON.stringify(payload))
            setIsModalOpen(true)
        }
    }

    useEffect(() => {
        async function fetchProject() {
            const data = await projectApi.fetchChosenProject(taskId)
            setProjectName(data.name)
        }
        if (taskId) {
            fetchProject()
        }
    }, [taskId])

    useEffect(() => {
        async function fetchResponses() {
            setIsLoading(true)
            const data = await responseApi.fetchAllResponses(taskId)
            setRepsonses(data)
            setIsLoading(false)
        }
        fetchResponses()
    }, [])

    return (
        <>
        <div className="mx-5 md:mx-62.5">
            <div className="text-2xl md:text-3xl font-bold">
                Отклики к задаче {isLoading ? <Skeleton width={350} height={40} /> : projectName}
                <div className="font-normal text-lg md:text-xl pt-3.75 mb-10 text-black">
                    Выберите студентов, которых готовы назначить исполнителями 
                </div>
            </div>
            <div className="grid 2xl:grid-cols-2 gap-5 md:gap-7.5 xl:grid-cols-1 pb-7">
                {isLoading ? (
                    <div className="flex gap-5">
                        {[1, 2].map(i => (
                            <div key={i} className="rounded-md">
                                <Skeleton height={364} width={695} />
                            </div>
                        ))}
                    </div>
                ): (
                    responses.map((response) => (
                        <ResponseCard 
                            key={response.id}
                            data={response} 
                            isSelected={selectedResponses.includes(response.id)}
                            onSelect={handleSelect}
                        />
                    ))
                )}
            </div>
            <div className="mx-auto w-max pb-5">
                <div 
                    className="px-9 py-3 cursor-pointer rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-base md:text-lg font-bold"
                    onClick={handleConfirm}
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