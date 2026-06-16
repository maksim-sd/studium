import { useNavigate } from 'react-router-dom'
import { useProjectCategoryStore } from '../store/ProjectCategoryStore'
import { useTechnologiesStore } from '../store/TechnologiesStore'
// import mobile from '../assets/mobile.png'
// import web from '../assets/web.png'
// import database from '../assets/database.png'
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

    // switch (category) {
    //     case 'Веб-программирование':
    //         return <img className='size-8 md:size-10' src={web} alt="" />;
    //     case 'Мобильная разработка':
    //         return <img className='size-8 md:size-10' src={mobile} alt="" />;
    //     case 'Создание и администрирование БД':
    //         return <img className='size-8 md:size-10' src={database} alt="" />;
    // }
}

function TaskCard ({ project }) {
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
        <div className='bg-white outline outline-gray-300 rounded-md md:max-w-264.25 p-3.75 md:p-7.5 text-base flex flex-col cursor-pointer' onClick={() => navigate(`/tasks/${project.id}`)}>
            <div className="font-semibold text-xl md:text-2xl text-green-700 pb-3 md:pb-6"> 
                {project.name}
            </div>
            {/* <div className="text-sm ">
                {task.author}
            </div> */}
            <div className="grid grid-cols-3 gap-2.75 md:gap-5.5 pb-3 md:pb-6">
                <div className="flex text-sm md:text-base">
                    <UserProjectCategory category={project.category_project_id} />
                </div>
                
                <div className="flex gap-5.5 text-sm md:text-base">
                    <img className='size-8 md-size-12' src={points} alt="" />
                    <div className="points-reward">
                        Вознаграждение
                        <div className="points-amount">
                            {project.number_of_points} баллов
                        </div>
                    </div>
                </div>
                {project.cash_reward && (
                    <div className="flex gap-5.5 text-sm md:text-base">
                        <img className='size-8 md:size-12' src={money} alt="" />
                        <div className="money-reward">
                            Денежное вознаграждение
                        </div>
                    </div>
                )}
            </div>
            <div className="line-clamp-4 mb-3 md:mb-6">
                {project.description}
            </div>
            <div className="flex gap-1.25 flex-wrap">
                {result.map((item) => (
                    <div className="bg-gray-200 px-2.5 py-1.5 rounded-[50px] text-sm">
                        {item.technologyName}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TaskCard