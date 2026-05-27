import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store/UserStore"

function ConfirmationModal ({task, onClose}) {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[30%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex rounded-md bg-white flex-col gap-6.25 text-center">
                    <div className="text-lg self-center">
                        Отлично!
                    </div>
                    <div className="">
                        Вы откликнулись на задачу {task}
                    </div>
                    <div className="text-gray-500 text-sm">
                        Отследить статус задачи можно в профиле
                    </div>
                    <div className="cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={onClose}>
                        Понятно
                    </div>
                </div>
            </div>
        </div>
    )   
}

function FeedbackModal ({ projectId, onClose }) {
    const user = useUserStore((state) => state.currentUser)

    const [feedbackText, setFeedbackText] = useState('')
    const [starNumber, setStarNumber] = useState(0)

    function StarRating({ totalStars = 5, onRatingChange }) {
        const [rating, setRating] = useState(0)
        const [hover, setHover] = useState(0)

        const handleRating = (currentRating) => {
            setRating(currentRating)
            if (onRatingChange) {
            onRatingChange(currentRating)
            }
        }

        return (
            <div className="flex items-start justify-between gap-2 my-4">
                <span className="text-base self-center font-medium text-gray-700">Ваша оценка:</span>
                <div className="flex gap-1">
                    {[...Array(totalStars)].map((_, index) => {
                        const starValue = index + 1;
                        
                        const isActive = starValue <= (hover || rating);

                        return (
                            <button
                            type="button"
                            key={starValue}
                            className={`text-3xl transition-colors duration-150 ease-in-out cursor-pointer focus:outline-none transform hover:scale-110`}
                            onClick={() => handleRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                            >
                                <span className={isActive ? 'text-amber-400 text-2xl' : 'text-gray-300 text-2xl'}>
                                    ★
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const handleSendFeedback = async () => {
        const data = {
            'number_stars': starNumber,
            'comment': feedbackText,
        }

        try {
            const response = await fetch(`/api/project_exchange/${projectId}/feedback/`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Basic ${user}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            })
            if (response.ok) {
                onClose()
                // notification?
            } else {
                alert('Не удалось оставить отзыв')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[35%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex rounded-md bg-white flex-col gap-6.25 text-center">
                    <div className="text-lg self-center">
                        Отлично!
                    </div>
                    <div className="">
                        Работа над задачей была завершена
                    </div>
                    <div className="text-gray-500 text-sm">
                        Оставьте исполнителям небольшой отзыв о их работе
                        <div className="">
                            <div className="">
                                <StarRating onRatingChange={setStarNumber} />
                            </div>
                            <textarea 
                                name="" 
                                id="" 
                                rows='7'
                                placeholder="Ваш отзыв..."
                                className="bg-white outline outline-gray-400 focus:outline-green-600 rounded-md w-full p-1.25"
                                value={feedbackText ?? ""}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={() => handleSendFeedback()}>
                        Отправить
                    </div>
                </div>
            </div>
        </div>
    )   
}

function ExecutorResponsePanel ({ project }) {
    const user = useUserStore((state) => state.currentUser)
    const [textResponse, setTextResponse] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const closeModal = () => {
        setIsModalOpen(false)
        navigate('/tasks')
    }

    const handleResponse = async (e) => {
        if (e) {
            e.preventDefault()
        }

        const data = {
            "comment": textResponse,
        }

        const response = await fetch(`/api/project_exchange/${project.id}/response/`, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${user}`,
                'Content-Type': 'application/json'
			},
            body: JSON.stringify(data)
		})

        if (response.ok) {
            setIsModalOpen(true)
        }
    }

    if (project.project_status === 'Поиск исполнителя') {
        if (project.permission?.leave_respond) {
            return (
                <>
                    <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-2.5 self-start">
                        <div className="font-bold text-xl">
                            Готовы приступить к выполнению задачи?
                        </div>
                        <div className="text-gray-700 text-sm">
                            Вы можете добавить небольшой текст к своему отклику, который увидит модератор, или продолжить без него
                        </div>
                        <textarea 
                            rows='7' 
                            placeholder='Место для отклика...' 
                            className='bg-white w-full resize-none p-1.25 rounded-md outline outline-gray-300 focus:outline-green-700'
                            value={textResponse ?? ""}
                            onChange={(e) => setTextResponse(e.target.value)}
                        />
                        <div 
                            className='rounded-md text-white bg-green-700 hover:bg-green-800 active:bg-green-900 w-full py-3.25 md:mt-3.75 font-bold text-base cursor-pointer' 
                            onClick={handleResponse}
                        >
                            Откликнуться
                        </div>
                    </div>
                    
                    {isModalOpen && <ConfirmationModal task={project.name} onClose={closeModal}/>}
                </>
            )
        } else {
            return (
                <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-2.5 self-start">
                    <div className="font-bold text-xl">
                        Вы уже откликнулись на данную задачу
                    </div>
                    <div className="text-gray-700 text-sm">
                        Если Вы будете назначены исполнителем, то задача появится в разделе "Текущие проекты"
                    </div>
                </div>
            )
        }
    } 
}

function ProjectManagementPanel ({ project }) {
    const userGroup = useUserStore((state) => state.groups)
    const user = useUserStore((state) => state.currentUser)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
    const navigate = useNavigate()

    const [responses, setResponses] = useState(0)
    const [participants, setParticipants] = useState([])

    const closeModal = () => {
        setIsModalOpen(false)
        setIsFeedbackModalOpen(false)
        navigate('/tasks')
    }

    const handleCanceling = async () => {
        if (!window.confirm("Вы уверены, что хотите отменить данный проект? Отменить действие будет невозможно")) return

        try {
            const response = await fetch(`/api/project_exchange/${project.id}/cancel/`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                navigate('/profile')
                // notification?
            } else {
                alert('Не удалось отменить проект')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    const handleCompleting = async () => {
        if (!window.confirm("Вы уверены, что хотите завершить работу над данным проектом?")) return

        try {
            const response = await fetch(`/api/project_exchange/${project.id}/complete/`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                setIsFeedbackModalOpen(true)
                // notification?
            } else {
                alert('Не удалось удалить пользователя')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) return

        try {
            const response = await fetch(`/api/project_exchange/${project.id}/user/${userId}/`, {
                method: 'DELETE', 
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                setParticipants(prevParticipants => ({
                    ...prevParticipants, 
                    moderators: prevParticipants.moderators.filter(person => person.id !== userId),
                    executors: prevParticipants.executors.filter(person => person.id !== userId),
                }))
                // notification?
            } else {
                alert('Не удалось удалить пользователя')
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    useEffect(() => {
        async function fetchResponses() {
            const response = await fetch(`/api/project_exchange/${project.id}/response/quantity/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setResponses(data)
            }
        }

        async function fetchParticipants() {
            const response = await fetch(`/api/project_exchange/${project.id}/participants/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setParticipants(data)
            }
        }

        if (userGroup === "Модератор" && project.permission?.view_responses) {
            fetchResponses()
        }

        if (project.permission?.view_participants) {
            fetchParticipants()
        }
    }, [project])

    return (
        <>
        <div className="flex basis-1/4">
            {(project.permission?.view_participants && project.project_status !== 'На проверке') &&
                <div className="flex flex-col min-h-[70vh]">
                    {(project.permission?.complete && project.project_status === 'В работе') &&
                        <div className="text-center font-bold mb-5 text-white bg-green-700 hover:bg-green-800 active:bg-green-900 rounded-md w-full py-3.25 mt-3.75" onClick={() => handleCompleting()}>
                            Завершить проект
                        </div>
                    }
                    <div className="text-lg font-bold self-center pb-5">
                        Текущие участники проекта:
                    </div>
                    <div className="flex flex-col">
                        <div className="border-b border-gray-400 pb-2.5">
                            Заказчик:
                            <div className="pl-2.5 py-4 text-sm">
                                {project.customer.last_name} {project.customer.first_name}
                            </div>
                        </div>
                        <div className="border-b border-gray-400 pt-5 pb-2.5">
                            Модераторы:
                            <ul className='pl-2.5 text-sm'>
                                {participants.moderators?.map((person) => (
                                    <li key={person.id} className='flex justify-between py-4'>
                                        <div className="">
                                            {person.last_name} {person.first_name}
                                        </div>
                                        <div onClick={() => handleDeleteUser(person.id)} className={`cursor-pointer ${userGroup === "Модератор" ? '' : "hidden"}`}>
                                            ❌
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-5 pb-2.5">
                            Исполнители:
                            <ul className='pl-2.5 text-sm'>
                                {participants.executors?.map((person) => (
                                    <li className='flex justify-between py-4'>
                                        <div className="">
                                            {person.last_name} {person.first_name}
                                        </div>
                                        <div onClick={() => handleDeleteUser(person.id)} className={`cursor-pointer ${userGroup === "Модератор" ? '' : "hidden"}`}>
                                            ❌
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {(userGroup === "Модератор" && project.permission?.view_participants) &&
                        <div className="self-center mt-auto mb-7.5">
                            <div onClick={() => navigate(`/tasks/${project.id}/edit-users`)} className="px-9 py-3 cursor-pointer rounded-md text-white text-lg font-bold bg-green-700 hover:bg-green-800 active:bg-green-900">
                                Добавить участников
                            </div>
                        </div>
                    }
                </div>
            }
            {(userGroup === "Заказчик" && project.permission?.cancel) && 
                <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-3.75 self-start">
                    <div className="flex flex-col gap-5">
                        <div className="text-xl font-bold">
                            Проект находится на проверке
                        </div>
                        <div className="text-sm">
                            После проверки модератором проект будет опубликован
                        </div>
                    </div>
                    <div className="text-sm pt-10 underline cursor-pointer" onClick={() => handleCanceling()}>
                        Отменить проект
                    </div>
                </div>
            }
            {userGroup === "Исполнитель" &&
                <ExecutorResponsePanel project={project} />
            }
            {(userGroup === "Модератор" && project.permission?.view_responses) &&
              <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-3.75 self-start">
                <div className="text-xl">
                  Количество откликнувшихся
                </div>
                <div className="font-bold text-2xl">
                  {responses}
                </div>
                <a href={`${project.id}/responses`} className='w-full'>
                  <div className="text-white bg-green-700 hover:bg-green-800 active:bg-green-900 rounded-md w-full py-3.25 mt-3.75">
                    Посмотреть откликнувшихся
                  </div>
                </a>
              </div>
            }
            </div>

            {isFeedbackModalOpen && <FeedbackModal projectId={project.id} onClose={closeModal}/>}
        </>
    )
}

export default ProjectManagementPanel