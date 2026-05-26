import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormatDate } from '../shared/FormatDate'
import { useUserStore } from '../store/UserStore'
import { useProductCategoryStore } from '../store/ProductCategoryStore'
import UserProject from '../components/UserProject'

function Profile () {
    const navigate = useNavigate()

    const user = useUserStore((state) => state.currentUser)
    const userData = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)
    const fetchCategories = useProductCategoryStore((state) => state.fetchCategories)

    const [currentProjects, setCurrentProjects] = useState([])
    const [responsedProjects, setResponsedProjects] = useState([])
    const [futureProjects, setFutureProjects] = useState([])
    const [moderateProjects, setModerateProjects] = useState([])
    const [underInspectionProjects, setUnderInspectionProjects] = useState([])
    const [archivedProjects, setArchivedProjects] = useState([])

    const [activeTab, setActiveTab] = useState('current-projects')

    const getTabs = (group) => {
        const tabsMap = {
            "Исполнитель": [
                {id: 'current-projects', label: 'Текущие проекты'},
                {id: 'my-responses', label: 'Мои отклики'},
                {id: 'archived-projects', label: 'Завершенные проекты'},
            ],
            "Заказчик": [
                {id: 'current-projects', label: 'Текущие проекты'},
                {id: 'looking-for-executor', label: 'Поиск исполнителя'},
                {id: 'under-inspection', label: 'На модерации'},
                {id: 'archived-projects', label: 'Завершенные проекты'},
            ],
            "Модератор": [
                {id: 'current-projects', label: 'Текущие проекты'},
                {id: 'looking-for-executor', label: 'Поиск исполнителя'},
                {id: 'wait-for-inspection', label: 'Проекты для модерации'},
                {id: 'archived-projects', label: 'Завершенные проекты'},
            ],
        }
        return tabsMap[group]
    }

    const tabs = getTabs(userGroup)

    const tabContent = {
        'current-projects': (
            <div className="">
                {currentProjects.length === 0 ? (
                    <div className="">
                        Нет текущих проектов на данный момент
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {currentProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        ),
        'my-responses': (
            <div className="">
                {responsedProjects.length === 0 ? (
                    <div className="">
                        Нет текущих проектов на данный момент
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {responsedProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        ),
        'looking-for-executor': (
            <div className="">
                {futureProjects.length === 0 ? (
                    <div className="">
                        На данный момент нет проектов, для которых идет процесс поиска исполнителя
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {futureProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        ),
        'wait-for-inspection': (
            <div className="">
                {moderateProjects.length === 0 ? (
                    <div className="">
                        На данный момент нет проектов, нуждающихся в модерации
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {moderateProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        ),
        'under-inspection': (
            <div className="">
                {underInspectionProjects.length === 0 ? (
                    <div className="">
                        На данный момент нет проектов, нуждающихся в модерации
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {underInspectionProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        ),
        'archived-projects': (
            <div className="">
                {archivedProjects.length === 0 ? (
                    <div className="">
                        Нет завершенных проектов на данный момент
                    </div>
                ) : (
                    <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                        {archivedProjects.map((project) => (
                            <UserProject project={project} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    useEffect(() => {
        window.scrollTo(0, 0)

        setActiveTab('current-projects')

        async function fetchProjects() {
            if (!user) return

            if (userGroup === "Модератор") {
                const responseModeration = await fetch(`/api/project_exchange/moderation/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${user}`
                    }
                })
                if (responseModeration.ok) {
                    const data = await responseModeration.json()

                    setModerateProjects(data.filter((project) => project.project_status === 'На проверке'))
                    setFutureProjects(data.filter((project) => project.project_status === 'Поиск исполнителя'))
                }
            }

            if (userGroup === "Исполнитель") {
                const responseResponses = await fetch('/api/project_exchange/responses/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${user}`
                    }
                })
                if (responseResponses.ok) {
                    const data = await responseResponses.json()
                    setResponsedProjects(data)
                }
            }

            const responseActive = await fetch(`/api/project_exchange/active/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (responseActive.ok) {
                const data = await responseActive.json()

                setCurrentProjects(data.filter((project) => project.project_status === 'В работе'))
                setUnderInspectionProjects(data.filter((project) => project.project_status === 'На проверке'))
                if (userGroup === "Заказчик") {
                    setFutureProjects(data.filter((project) => project.project_status === "Поиск исполнителя"))
                }
            }

            const responseArchived = await fetch('/api/project_exchange/history/', {
                method: 'GET',
				headers: {
					'Authorization': `Basic ${user}`
				}
			})
            if (responseArchived.ok) {
                const data = await responseArchived.json()
                setArchivedProjects(data)
            }
		}

        fetchProjects()

        const intervalId = setInterval(() => {
            if (user) {
                fetchProjects()
            }
        }, 5000)

        return () => clearInterval(intervalId)

    }, [user, userGroup])

    return (
        <div className="mx-5 sm:mx-15 lg:mx-62.5">
            <div className="flex gap-7.5 mb-12.5">
                <div className="bg-gray-200 w-18.75 h-18.75 md:w-37.5 md:h-37.5 rounded-full content-center text-center">
                    фото
                </div>
                <div className="flex justify-between basis-7/8">
                    <div className="flex flex-col mt-2.5 md:mt-5">
                        <div className="font-bold text-xl md:text-2xl mb-2.5 md:mb-3">
                            {userData.last_name} {userData.first_name} {userData.patronymic}
                        </div>
                        {userGroup === 'Исполнитель' &&
                            <div className="flex flex-col gap-5">
                                <div className="text-base text-gray-600">
                                    {userData.faculty}, {userData.specialty}, {userData.study_group}
                                </div>
                                <div className="text-sm md:text-lg">
                                    Рейтинг пользователя: {userData.average_rating}⭐
                                </div>
                            </div>
                        }
                        {userGroup === 'Заказчик' &&
                            <div className="px-4 py-2 rounded-md cursor-pointer text-sm md:text-lg bg-green-700 hover:bg-green-800 active:bg-green-900 text-center text-white mt-5"
                                onClick={() => navigate('/create-new-task')}>
                                Создать новую задачу
                            </div>
                        }
                    </div>
                    <div className="text-gray-400">
                        Последний логин: {FormatDate(userData.last_login)}
                    </div>
                </div>
            </div>
            <div className="">
                <div className="flex justify-between border-b border-gray-300 w-full">
                    <div className="">
                        {tabs.map((tab) => (
                            <button key={tab.id}
                                className={`px-4 py-2 hover:text-green-600 font-medium cursor-pointer ${
                                    activeTab === tab.id ? "border-b-2 border-green-700 " : 'text-gray-500'
                                }`}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div onClick={() => navigate('/help-us-become-better')} className="cursor-pointer hover:border-b hover:border-b-green-700">
                        Помогите нам стать лучше!
                    </div>
                </div>
                <div className="p-4">
                    {tabContent[activeTab]}
                </div>
            </div>
        </div>
    )
}

export default Profile
