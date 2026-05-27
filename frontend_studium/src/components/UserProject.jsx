import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'
import { useTechnologiesStore } from '../store/TechnologiesStore'
import { useProjectCategoryStore } from '../store/ProjectCategoryStore'
import points from '../assets/points-reward.png'
import money from '../assets/money-reward.png'

function UserProjectCategory ({ category }) {
    const categories = useProjectCategoryStore((state) => state.categories)
    const projectCategory = categories.find(item => item.id === category)

    console.log(projectCategory.icon)

    return (
        <div className="flex items-center text-sm gap-2">
            <img className='size-8 md:size-10 shrink-0' src={projectCategory?.icon} alt='' />
            {projectCategory?.name}
        </div>
    )
}

function UserProjectButton ({ activeTab, project }) {
    const navigate = useNavigate()
    const user = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)

    switch(activeTab) {
        case 'current-projects':
            return (
                <div className="flex gap-3.75 text-sm">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-nowrap rounded-md" onClick={() => navigate(`/chats`)}>
                        Перейти к чату
                    </div>
                    <div className="underline px-3.5 py-1.25 hover:font-medium cursor-pointer hidden md:block" onClick={() => navigate(`/tasks/${project.id}`)}>
                        Посмотреть подробности задачи
                    </div>
                </div>
            )

        case 'my-responses':
            return (
                <div className="flex mt-auto gap-3.75">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/tasks/${project.id}`)}>
                        Посмотреть подробности задачи
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
                    <div className={`${userGroup === 'Модератор' ? 'underline px-3.5 py-1.25 hover:font-medium cursor-pointer' : 'px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md'}`} onClick={() => navigate(`/tasks/${project}`)}>
                        Посмотреть подробности задачи
                    </div>
                </div>
            )

        case 'under-inspection':
            return (
                <div className="flex gap-3.75">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/tasks/${project.id}`)}>
                        Посмотреть подробности задачи
                    </div>
                </div>
            )

        case 'wait-for-inspection':
            return (
                <div className="flex gap-3.75">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-sm rounded-md" onClick={() => navigate(`/moderate-task/${project.id}`)}>
                        Перейти к задаче
                    </div>
                </div>
            )

        case 'cancelled-projects':
            return (
                <div className="flex gap-3.75 text-sm">
                    <div className="px-3.5 py-1.25 text-white bg-green-700 hover:bg-green-800 cursor-pointer text-nowrap rounded-md" onClick={() => navigate(`/chats`)}>
                        Посмотреть подробности задачи
                    </div>
                </div>
            )
            
        case 'archived-projects':
            return (
                <div className="flex gap-3.75 text-sm">
                    <div className="w-full">
                        <div className="flex justify-between pb-2.5">
                            <div className="font-bold">
                                {userGroup === "Заказчик" ? "Ваш комментарий" : "Комментарий от заказчика"}
                            </div>
                            <div className="">
                                {Array.from({ length: project.number_stars }).map((_, index) => (
                                    <span>⭐</span>
                                ))}
                            </div>
                        </div>
                        <div className="pl-2.5">
                            {project.comment}
                        </div>
                    </div>
                </div>
            )
        }
}

function UserProject ({ project, activeTab }) {
    const navigate = useNavigate()

    const technologies = useTechnologiesStore((state) => state.technologies)
    const categories = useProjectCategoryStore((state) => state.categories)

    const techList = project.technologies_id.map(technology_id => {
        const technology = technologies.find(item => item.id === technology_id)
        return {
            ...technology_id,
            technologyName: technology ? technology.name : '',
        }
    })
    
    return (
        <div className='outline outline-gray-200 rounded-md max-w-173.5 p-3 md:p-5 text-base flex flex-col'>
            <div className="font-semibold text-base md:text-lg pb-6 cursor-pointer" onClick={() => navigate(`/tasks/${project.id}`)}> 
                {project.name}
            </div>
            {/* <div className="text-xs md:text-sm pb-4 md:pb-6">
                {project.author}
            </div> */}
            <div className="flex items-center gap-15 md:gap-10 pb-3 md:pb-6">
                <UserProjectCategory category={project.category_project_id} />
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
                {techList.map((item) => (
                    <div className="bg-gray-200 px-2.5 py-1.5 rounded-[50px] text-xs">
                        {item.technologyName}
                    </div>
                ))}
            </div>

            <UserProjectButton activeTab={activeTab} project={project}/>

        </div>
    )
}

export default UserProject