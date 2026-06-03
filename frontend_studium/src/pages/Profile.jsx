import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { projectApi } from '../api/project'
import { FormatDate } from '../shared/FormatDate'
import { useUserStore } from '../store/UserStore'
import { useProductCategoryStore } from '../store/ProductCategoryStore'
import UserProject from '../components/UserProject'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { userApi } from '../api/user'
import avatar from '../assets/avatar.png'

function Profile () {
    const navigate = useNavigate()

    const user = useUserStore((state) => state.currentUser)
    const userData = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)
    const allGroups = useUserStore((state) => state.allGroups)
    const updateUserPhoto = useUserStore((state) => state.updateUserPhoto)
    const fetchCategories = useProductCategoryStore((state) => state.fetchCategories)

    const [currentProjects, setCurrentProjects] = useState([])
    const [responsedProjects, setResponsedProjects] = useState([])
    const [futureProjects, setFutureProjects] = useState([])
    const [moderateProjects, setModerateProjects] = useState([])
    const [underInspectionProjects, setUnderInspectionProjects] = useState([])
    const [archivedProjects, setArchivedProjects] = useState([])

    const { userId } = useParams()
    const [chosenUser, setChosenUser] = useState([])
    const [chosenUserGroup, setChosenUserGroup] = useState('')
    const [isOwnProfile, setIsOwnProfile] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

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
                {id: 'looking-for-executor', label: 'Отклики на задачи'},
                {id: 'wait-for-inspection', label: 'Проекты для модерации'},
                {id: 'archived-projects', label: 'Завершенные проекты'},
            ],
        }
        return tabsMap[group]
    }

    let tabs

    if (isOwnProfile) {
        tabs = getTabs(userGroup)
    } else {
        tabs = [
            {id: 'current-projects', label: 'Текущие проекты'},
            {id: 'archived-projects', label: 'Завершенные проекты'},
        ]
    }

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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
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
                            <UserProject project={project} activeTab={activeTab} isOwnProfile={isOwnProfile} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    useEffect(() => {
        window.scrollTo(0, 0)

        setActiveTab('current-projects')

        async function fetchProjects(isInitial = false) {
            if (!user) return

            if (isInitial) {
                setIsLoading(true)
            }

            if (userGroup === "Модератор") {
                const data = await projectApi.fetchModerateProjects()

                setModerateProjects(data.filter((project) => project.project_status === 'На проверке'))
                setFutureProjects(data.filter((project) => project.project_status === 'Поиск исполнителя'))
            }

            if (userGroup === "Исполнитель") {
                const data = await projectApi.fetchResponsedProjects()
                setResponsedProjects(data)
            }

            if (isOwnProfile) {
                const active = await projectApi.fetchActiveProjects()
                const archived = await projectApi.fetchArchivedProjects()

                setCurrentProjects(active.filter((project) => project.project_status === 'В работе'))
                setUnderInspectionProjects(active.filter((project) => project.project_status === 'На проверке'))
                setArchivedProjects(archived)

                if (userGroup === "Заказчик") {
                    setFutureProjects(active.filter((project) => project.project_status === "Поиск исполнителя"))
                }
            } else {
                const chosenUserData = await userApi.fetchChosenUser(userId)
                const active = await projectApi.fetchUserActiveProjects(userId)
                const archived = await projectApi.fetchUserHistoryProjects(userId)

                setChosenUser(chosenUserData)
                setChosenUserGroup(allGroups.filter(group => chosenUserData?.groups_id?.[0] === group.id)[0]?.name)
                setCurrentProjects(active.filter((project) => project.project_status === 'В работе'))
                setArchivedProjects(archived)
            }

            if (isInitial) {
                setIsLoading(false)
            }
		}

        if (!userId) {
            setIsOwnProfile(true)
        } else {
            if (Number(userId) === Number(userData.id)) {
                setIsOwnProfile(true)
            } else {
                setIsOwnProfile(false)
            }
        }

        fetchProjects(true)
        
        const intervalId = setInterval(() => {
            if (user) {
                fetchProjects(false)
            }
        }, 5000)

        return () => clearInterval(intervalId)

    }, [user, userGroup, isOwnProfile])

    const fileInputRef = useRef(null)

    const handleChangeProfilePhoto = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = async (e) => {
        const file = event.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('image', file)

        if (file) {
            try {
                await updateUserPhoto(formData)
                e.target.value = ''
            } catch (error) {
                console.log(error)
            }
        }
    }

    const photoUrl = isOwnProfile ? userData?.photo : chosenUser?.photo

    return (
        <div className="mx-5 sm:mx-15 lg:mx-62.5">
            <div className="flex gap-7.5 mb-12.5">
                {isLoading ? (
                    <Skeleton circle width={150} height={150} />
                ) : (
                    <div className="relative w-37.5 h-37.5">
                        <input
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/*"
                            className='hidden'
                            disabled={!isOwnProfile}
                        />
                        <img 
                            className={`${isOwnProfile ? "peer absolute z-1 transition-all duration-300 hover:brightness-50 cursor-pointer" : ""} w-18.75 h-18.75 md:w-37.5 md:h-37.5 rounded-full content-center object-cover`}
                            src={photoUrl === null ? avatar : photoUrl} 
                            alt="" 
                            onClick={handleChangeProfilePhoto}
                        />
                        <div className="hidden peer-hover:block absolute z-2 text-center justify-self-center mt-17 text-white pointer-events-none">
                            Изменить фото
                        </div>
                    </div>
                )}
                <div className="flex justify-between basis-7/8">
                    {isLoading ? (
                        <div className="mt-2.5 md:mt-5">
                            <Skeleton height={40} width={400} className='mb-3'/>
                            <Skeleton height={20} width={250}/>
                        </div>
                    ) : (
                        <div className="flex flex-col mt-2.5 md:mt-5">
                            <div className="font-bold text-xl md:text-2xl mb-2.5 md:mb-3">
                                {isOwnProfile ? `${userData.last_name} ${userData.first_name} ${userData.patronymic}` : `${chosenUser.last_name} ${chosenUser.first_name} ${chosenUser.patronymic}`}
                            </div>
                            <div className="h-fit rounded-md mb-2.5 md:mb-3 font-semibold">
                                {isOwnProfile ? userGroup : allGroups.filter(group => chosenUser?.groups_id?.[0] === group.id)[0]?.name}
                            </div>

                            {(userGroup === 'Исполнитель' || chosenUserGroup === 'Исполнитель') &&
                                <div className="text-base text-gray-600 mt-3">
                                    Факультет {isOwnProfile ? `${userData.faculty}, ${userData.specialty}, ${userData.study_group}` : `${chosenUser.faculty}, ${chosenUser.specialty}, ${chosenUser.study_group}`}
                                </div>
                            }
                            {(userGroup === 'Заказчик' && isOwnProfile) &&
                                <div className="">
                                    {/* <div className="text-base text-gray-600 mt-3">
                                        {isOwnProfile ? `${userData.faculty}, ${userData.specialty}, ${userData.study_group}` : `${chosenUser.faculty}, ${chosenUser.specialty}, ${chosenUser.study_group}`}
                                    </div> */}
                                    <div className="px-4 py-2 rounded-md cursor-pointer text-sm md:text-lg bg-green-700 hover:bg-green-800 active:bg-green-900 text-center text-white mt-5"
                                        onClick={() => navigate('/create-new-task')}>
                                        Создать новый проект
                                    </div>
                                </div>
                            }
                        </div>
                    )}
                        
                    {(userGroup === 'Исполнитель' || chosenUserGroup === 'Исполнитель') && 
                        <div className={`text-sm md:text-lg mt-2.5 md:mt-5 outline-2 outline-amber-400 px-2 py-0.5 rounded-md h-fit ${(userData.average_rating > 3.5 || chosenUser.average_rating > 3.5) ? "outline-green-700" : "outline-amber-400"}`}>
                            Рейтинг пользователя: {isOwnProfile ? userData.average_rating.toFixed(1) : chosenUser.average_rating.toFixed(1)}⭐
                        </div>
                    }
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
                    {isOwnProfile &&
                        <div onClick={() => navigate('/help-us-become-better')} className="cursor-pointer hover:border-b hover:border-b-green-700">
                            Помогите нам стать лучше!
                        </div>
                    }
                </div>
                <div className="p-4">
                    {isLoading ? (
                        <div className="grid 2xl:grid-cols-2 gap-7.5 xl:grid-cols-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="border border-gray-200 rounded-md p-5">
                                    <Skeleton height={18} width="60%" className="mb-6" />
                                    <div className="flex gap-5 mb-6">
                                        <Skeleton height={40} width={150} />
                                        <Skeleton height={40} width={150} />
                                    </div>
                                    <Skeleton height={16} count={3} className="mb-6" />
                                    <div className="flex gap-1.25 mb-6">
                                        <Skeleton width={60} height={28} />
                                        <Skeleton width={60} height={28} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton width={80} height={30} />
                                        <Skeleton width={80} height={30} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ): (
                        tabContent[activeTab]
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
