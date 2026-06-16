import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'
import { useTechnologiesStore } from '../store/TechnologiesStore'
import { useProjectCategoryStore } from '../store/ProjectCategoryStore'
import { FormatDate } from '../shared/FormatDate'
import points from '../assets/points-reward.png'
import money from '../assets/money-reward.png'
import custom_category from '../assets/custom_category.png'

function UserProjectCategory ({ category }) {
    const categories = useProjectCategoryStore((state) => state.categories)
    const projectCategory = categories.find(item => item.id === category)

    return (
        <div className="flex items-center text-sm gap-2">
            <img className='size-8 md:size-10 shrink-0' src={projectCategory?.icon} alt='' />
            {projectCategory?.name}
        </div>
    )
}

function UserProjectButton ({ activeTab, project, isOwnProfile }) {
    const navigate = useNavigate()
    const user = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)

    switch(activeTab) {
        case 'current-projects':
            return (
                isOwnProfile ? (
                    <div className="flex gap-3.75 text-sm">
                        <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-nowrap rounded-md" onClick={() => navigate(`/chats`)}>
                            Перейти к чату
                        </div>
                        <div className="underline px-3.5 py-1.25 hover:font-medium cursor-pointer hidden md:block" onClick={() => navigate(`/tasks/${project.id}`)}>
                            Посмотреть подробности проекта
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3.75 text-sm">
                        <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-nowrap rounded-md" onClick={() => navigate(`/chats`)}>
                            Посмотреть подробности проекта
                        </div>
                    </div>
                )
            )
        case 'my-responses':
            return (
                <div className='flex gap-3.75 text-sm'>
                    <div className="w-full">
                        <div className="flex justify-between pb-2.5">
                            <div className="font-bold">
                                Вы откликнулись:
                            </div>
                            <div className="">
                                {FormatDate(project.response_create_at)}
                            </div>
                        </div>
                        <div className={`${project.response_comment ? 'pl-2.5' : 'hidden'}`}>
                            {project.response_comment}
                        </div>
                    </div>
                </div>
            )

        case 'looking-for-executor':
            return (
                <div className="flex gap-3.75 text-sm">
                    {userGroup === 'Модератор' &&
                        <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/tasks/${project.id}/responses`)}>
                            Посмотреть откликнувшихся
                        </div>
                    }
                    <div className={`${userGroup === 'Модератор' ? 'underline px-3.5 py-1.25 hover:font-medium cursor-pointer' : 'px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md'}`} onClick={() => navigate(`/tasks/${project.id}`)}>
                        Посмотреть подробности проекта
                    </div>
                </div>
            )

        case 'under-inspection':
            return (
                <div className="flex gap-3.75">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/tasks/${project.id}`)}>
                        Посмотреть подробности проекта
                    </div>
                </div>
            )

        case 'wait-for-inspection':
            return (
                <div className="flex gap-3.75">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/moderate-task/${project.id}`)}>
                        Перейти к описанию проекта
                    </div>
                </div>
            )

        case 'cancelled-projects':
            return (
                <div className="flex gap-3.75 text-sm">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-nowrap rounded-md" onClick={() => navigate(`/chats`)}>
                        Посмотреть подробности проекта
                    </div>
                </div>
            )
            
        case 'archived-projects':
            return (
                <div className={`${(project.comment && project.number_stars > 0) ? 'flex gap-3.75 text-sm' : 'hidden'}`}>
                    <div className="w-full">
                        <div className="flex justify-between pb-2.5">
                            <div className="font-bold">
                                {userGroup === "Заказчик" ? "Ваш отзыв" : "Отзыв от заказчика"}
                            </div>
                            <div className="">
                                {Array.from({ length: project.number_stars }).map((_, index) => (
                                    <span>⭐</span>
                                ))}
                            </div>
                        </div>
                        <div className={`${project.comment ? 'pl-2.5' : 'hidden'}`}>
                            {project.comment}
                        </div>
                    </div>
                </div>
            )
        }
}

function UserProject ({ project, activeTab, isOwnProfile }) {
    const navigate = useNavigate()

    const technologies = useTechnologiesStore((state) => state.technologies)
    const categories = useProjectCategoryStore((state) => state.categories)

    const techList = project?.technologies_id ? project.technologies_id.map(technology_id => {
        const technology = technologies.find(item => item.id === technology_id)
        return {
            ...technology_id,
            technologyName: technology ? technology.name : '',
        }
    }) : []

    const customTech = project?.custom_technologies ? project.custom_technologies.split(',').map(item => ({ id: item.trim(), technologyName: item.trim() })) : []

    const result = [...techList, ...customTech]
    
    return (
        <div className='outline outline-gray-200 rounded-md max-w-173.5 p-3 md:p-5 text-base flex flex-col'>
            <div className="font-semibold text-base md:text-lg pb-6 cursor-pointer" onClick={() => navigate(`/tasks/${project.id}`)}> 
                {project.name}
            </div>
            <div className="flex items-center gap-15 md:gap-10 pb-3 md:pb-6">
                {project.category_project_id !== null && 
                    <UserProjectCategory category={project.category_project_id} />
                }
                {project.category_project_id === null && 
                    <div className="flex items-center text-sm gap-2">
                        <img className='size-8 md:size-10 shrink-0' src={custom_category} alt='' />
                        {project.custom_category_project}
                    </div>
                }
                <div className="flex gap-2">
                    <img className='size-8 md:size-10' src={points} alt="" />
                    <div className="text-sm">
                        Награда
                        <div className="">
                            {project.number_of_points}
                        </div>
                    </div>
                </div>
                {project.cash_reward && (
                    <div className="flex gap-2">
                        <img className='size-8 md:size-10' src={money} alt="" />
                        <div className="text-sm">
                            Денежное вознаграждение
                        </div>
                    </div>
                )}
            </div>
            <div className="md:text-base text-sm line-clamp-4 md:line-clamp-3 mb-2 md:mb-6">
                {project.description}
            </div>
            <div className="flex gap-1.25 flex-wrap pb-3 md:pb-6">
                {result.map((item) => (
                    <div className="bg-gray-200 px-2.5 py-1.5 rounded-[50px] text-xs">
                        {item.technologyName}
                    </div>
                ))}
                {/* {(project.custom_technologies !== null && project.custom_technologies !== '') &&
                    <div className="bg-gray-200 px-2.5 py-1.5 rounded-[50px] text-xs">
                        {project.custom_technologies}
                    </div>
                } */}
            </div>

            <UserProjectButton activeTab={activeTab} project={project} isOwnProfile={isOwnProfile} />

        </div>
    )
}

export default UserProject