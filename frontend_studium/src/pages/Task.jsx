import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { projectApi } from "../api/project"
import { FormatDate } from "../shared/FormatDate"
import { useUserStore } from "../store/UserStore"
import { useTechnologiesStore } from "../store/TechnologiesStore"
import { useProjectCategoryStore } from "../store/ProjectCategoryStore"
import { useOrganizationStore } from "../store/OrganizationStore"
import ProjectManagementPanel from "../components/ProjectManagementPanel"
import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css';
import custom_category from '../assets/custom_category.png'
import points from '../assets/points-reward.png'
import money from '../assets/money-reward.png'

function UserProjectCategory ({ category }) {
    const categories = useProjectCategoryStore((state) => state.categories)
    const projectCategory = categories.find(item => item.id === category)

    return (
        <div className="flex justify-baseline text-sm gap-2">
            <img className='size-8 md:size-10' src={`${projectCategory?.icon}`} alt='' />
            {projectCategory?.name}
        </div>
    )
}

function ProjectStatus ({ status }) {
    const statusColors = {
        "На проверке": "outline-gray-500 text-500",
        "Поиск исполнителя": "outline-amber-600 text-amber-600",
        "В работе": "outline-green-700 text-green-700",
        "Завершен": "outline-blue-500 text-blue-500",
    }

    return (
        <div className={`outline rounded-md px-2 py-0.5 ${statusColors[status]}`}>
            {status}
        </div>
    )
}

// function ConfirmationModal ({task, onClose}) {
//     return (
//         <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
//             <div className="w-[30%] absolute top-[50%] left-[50%] translate-[-50%]">
//                 <div className="p-6.25 flex rounded-md bg-white flex-col gap-6.25 text-center">
//                     <div className="text-lg self-center">
//                         Отлично!
//                     </div>
//                     <div className="">
//                         Вы откликнулись на задачу {task}
//                     </div>
//                     <div className="text-gray-500 text-sm">
//                         Отследить статус задачи можно в профиле
//                     </div>
//                     <div className="cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={onClose}>
//                         Понятно
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )   
// }

function Task() {
    const user = useUserStore((state) => state.currentUser)
    const userData = useUserStore((state) => state.currentUserData)

    const organizations = useOrganizationStore((state) => state.organizations)
    const [currentOrganization, setCurrentOrganization] = useState([])

    const { taskId } = useParams()

    const [projectData, setProjectData] = useState([])
    const [techList, setTechList] = useState([])

    const [isLoading, setIsLoading] = useState(false)

    // const currentTask = tasks.find(task => task.id === Number(taskId))

    // const [isModalOpen, setIsModalOpen] = useState(false)
    // const navigate = useNavigate()

    // const closeModal = () => {
    //     setIsModalOpen(false)
    //     navigate('/tasks')
    // }

    const technologies = useTechnologiesStore((state) => state.technologies)

    useEffect(() => {
        async function fetchProject() {
            setIsLoading(true)

            const data = await projectApi.fetchChosenProject(taskId)
            
            setProjectData(data)
                    
            setCurrentOrganization(organizations.find(item => item.id === data.customer.organization_id))
            
            const techList = data.technologies_id.map(technology_id => {
                const technology = technologies.find(item => item.id === technology_id)
                    return {
                        ...technology_id,
                        technologyName: technology ? technology.name : '',
                    }
                })

                setTechList(techList)

                setIsLoading(false)
            }
        if (taskId) {
            fetchProject()
        }
    }, [taskId])

    return (
        <>
            <div className="mx-5 md:mx-62.5 min-h-[85vh]">
          {/* кнопка назад */}
          {/* <div className="pb-7.5">
            <a className="text-base text-gray-800 flex gap-2.5" href='/tasks'>
              <div className="rounded-full px-1.25">
                ⬅
              </div>
              <div className="self-end">
                Назад
              </div>
            </a>
          </div> */}
          {/* кнопка назад */}
                <div className="flex flex-col md:flex-row gap-7.5">
                    <div className="flex basis-264.5 flex-col gap-10">
                        <div className="">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-10">
                                    <div className="text-xl md:text-2xl font-semibold">
                                        {isLoading ? <Skeleton height={24} width={400}/> : projectData.name }
                                    </div>
                                    {isLoading ? <Skeleton height={22} width={200}/> : <ProjectStatus status={projectData.project_status} />}
                                </div>
                                
                                {projectData.permission?.change &&
                                    <div className="flex flex-nowrap mt-1.25">
                                        <div className="self-center pr-1.25">
                                            🗎
                                        </div>
                                        <a href={`/tasks/${projectData.id}/edit`} className="flex-start underline text-nowrap text-base">
                                            Редактировать задачу
                                        </a>
                                    </div>
                                }
                            </div>
                            <div className="flex gap-3.75 md:gap-7.5 text-sm md:text-sm pt-1.25 md:pt-2.5 font-normal">
                                <p>
                                    Автор: {isLoading ? <Skeleton height={14} width={200}/> : currentOrganization?.full_name }
                                </p>
                                <p>
                                    Опубликовано: {isLoading ? <Skeleton height={14} width={120}/> : FormatDate(projectData.created_at) }
                                </p>
                            </div>
                        </div>
                        <div className="text-lg md:text-xl font-semibold">
                            Описание проекта
                            <div className="text-base pt-1.25 md:pt-2.5 pb-10 font-normal">
                                {isLoading ? <Skeleton height={16} width={878} count={5}/> : projectData.description }
                            </div>
                            <div className="font-normal text-base">
                                <div className="flex items-center gap-15 md:gap-20">
                                    <div className="flex justify-baseline gap-2">
                                        {projectData.category_project_id !== null &&
                                            <UserProjectCategory category={projectData.category_project_id} />
                                        }
                                        {projectData.category_project_id === null &&
                                            <div className="flex justify-baseline text-sm gap-2">
                                                <img className='size-8 md:size-10' src={custom_category} alt='' />
                                                {projectData.custom_category_project}
                                            </div>
                                        }
                                    </div>
                                    <div title="Сумма баллов, которые получит исполнитель в случае успешного выполнения задачи" className="flex gap-2">
                                        <img className='size-8 md:size-10' src={points} alt="" />
                                        <div className="">
                                            Вознаграждение
                                            <div className="">
                                                {isLoading ? <Skeleton height={24} width={40}/> : `${projectData.number_of_points} баллов`} 
                                            </div>
                                        </div>
                                    </div>
                                    {projectData.cash_reward && (
                                        <div className="flex gap-2">
                                            <img className='size-8 md:size-10' src={money} alt="" />
                                            <div className="">
                                                Денежное вознаграждение
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-lg md:text-xl font-semibold">
                            Стек технологий
                            <div className="text-sm pt-1.25 md:pt-2.5 font-normal">
                                Список технологий, которые будут полезны при выполнении данной задачи
                            </div>
                            <div className="flex gap-1.25 md:gap-2 flex-wrap pt-3.25 md:pt-5.25">
                                {techList.map((item) => (
                                    <div className="bg-gray-200 px-3 py-1.5 rounded-[50px] text-sm font-normal">
                                        {item.technologyName}
                                    </div>
                                ))}
                                {(projectData.custom_technologies !== '' && projectData.custom_technologies !== null) &&
                                    <div className="bg-gray-200 px-3 py-1.5 rounded-[50px] text-sm font-normal">
                                        {projectData.custom_technologies}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className="text-lg md:text-xl font-semibold">
                            Срок выполнения
                            <div className="text-sm pt-1.25 md:pt-2.5 font-normal">
                                Проект необходимо выполнить до <span className='font-bold'>{isLoading ? <Skeleton height={14} width={80}/> : new Date(projectData.due_date).toLocaleDateString('ru-RU') }</span>
                            </div>
                        </div>

                        {(!isLoading && projectData.files?.length !== 0) &&
                            <div className="text-lg md:text-xl font-semibold">
                                Дополнительные материалы
                                <div className="text-sm pt-1.25 md:pt-2.5 font-normal">
                                    Материалы, связанные с данным проектом
                                </div>
                                <div className="flex gap-1.25 md:gap-2 flex-wrap pt-3.25 md:pt-5.25">
                                    {projectData.files?.map((file) => {
                                        const fileName = decodeURIComponent(file.file.split('/').pop())
                                        const downloadUrl = file.file

                                        return (
                                            <div className="bg-gray-200 px-3 py-1.5 rounded-[50px] text-sm font-normal underline cursor-pointer">
                                            <a href={downloadUrl} download={fileName}>
                                                {fileName}
                                            </a>
                                        </div>
                                        )
                                    })}
                                </div>
                            </div>
                        }
                    </div>
              {/* <div className={`text-lg md:text-xl font-semibold ${user.role === 'moderator' ? 'hidden' : '' }`}>
                Количество откликов на задачу
                <div className="text-base pt-1.25 md:pt-2.5 font-normal">
                  На данный момент на задачу откликнулись <span className='font-bold'>xxx</span> исполнителей
                </div>
              </div>
              <div className="text-lg md:text-xl font-semibold">
                Другие задачи от автора
                <div className="text-base pt-5 font-normal text-gray-500">
                  Если будет такое API, то в этом блоке можно будет показать 2-3 задачки от автора текущей задачи или схожие по категории задачи. Если такого API не будет, то этот блок будет просто удален
                </div>
              </div> */}
            

                    <ProjectManagementPanel project={projectData} />
            {/* <div className="flex basis-1/4">
            {user.role === 'student' &&
              <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-2.5 self-start">
                <div className="font-bold text-xl">
                  Готовы приступить к выполнению задачи?
                </div>
                <div className="text-gray-700 text-sm">
                  Вы можете добавить небольшой текст к своему отклику, который увидит модератор, или продолжить без него
                </div>
                <textarea rows='7' placeholder='Место для отклика...' className='bg-white w-full resize-none p-1.25 rounded-md outline outline-gray-300 focus:outline-green-700'/>
                <div className='rounded-md text-white bg-green-700 hover:bg-green-800 active:bg-green-900 w-full py-3.25 md:mt-3.75 font-bold text-base cursor-pointer' onClick={() => setIsModalOpen(true)}>
                  Откликнуться
                </div>
              </div>
            }
            {user.groups_id === 1 &&
              <div className="bg-gray-100 rounded-md flex flex-col p-5 items-center text-center gap-3.75 self-start">
                <div className="text-xl">
                  Количество откликнувшихся
                </div>
                <div className="font-bold text-2xl">
                  XXX
                </div>
                <a href={`${taskId}/responses`} className='w-full'>
                  <div className="text-white bg-green-700 hover:bg-green-800 active:bg-green-900 rounded-md w-full py-3.25 mt-3.75">
                    Посмотреть откликнувшихся
                  </div>
                </a>
              </div>
            }
            </div> */}
                </div>
            </div>

            {/* {isModalOpen && <ConfirmationModal task={projectData.title} onClose={closeModal}/>} */}

        </>
    )
}

export default Task