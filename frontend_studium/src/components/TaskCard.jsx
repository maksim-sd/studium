import { useNavigate } from 'react-router-dom'
import mobile from '../assets/mobile.png'
import web from '../assets/web.png'
import database from '../assets/database.png'
import points from '../assets/points-reward.png'
import money from '../assets/money-reward.png'

function TaskCardCategory ({ category }) {
    switch (category) {
        case 'Веб-программирование':
            return <img className='size-8 md:size-12' src={web} alt="" />;
        case 'Мобильная разработка':
            return <img className='size-8 md:size-12' src={mobile} alt="" />;
        case 'Создание и администрирование БД':
            return <img className='size-8 md:size-12' src={database} alt="" />;
    }
}

function TaskCard ({ task }) {
    const navigate = useNavigate()
    
    return (
        <div className='bg-white outline outline-gray-300 rounded-md md:max-w-264.25 p-3.75 md:p-7.5 text-base flex flex-col cursor-pointer' onClick={() => navigate(`/tasks/${task.id}`)}>
            <div className="font-semibold text-xl md:text-2xl text-green-700 pb-3 md:pb-6"> 
                {task.title}
            </div>
            {/* <div className="text-sm ">
                {task.author}
            </div> */}
            <div className="grid grid-cols-3 gap-2.75 md:gap-5.5 pb-3 md:pb-6">
                <div className="flex text-sm md:text-base">
                    <TaskCardCategory category={task.category} />
                    {task.category}
                </div>
                
                <div className="flex gap-5.5 text-sm md:text-base">
                    <img className='size-8 md-size-12' src={points} alt="" />
                    <div className="points-reward">
                        Награда
                        <div className="points-amount">
                            {task.points_reward}
                        </div>
                    </div>
                </div>
                {task.money_reward !== 0 && (
                    <div className="flex gap-5.5 text-sm md:text-base">
                        <img className='size-8 md:size-12' src={money} alt="" />
                        <div className="money-reward">
                            Денежное вознаграждение
                        </div>
                    </div>
                )}
            </div>
            <div className="line-clamp-4 mb-3 md:mb-6">
                {task.description}
            </div>
            <div className="flex gap-1.25 flex-wrap">
                {task.technologies.map((technology) => (
                    <div className="bg-gray-200 px-2.5 py-1.5 rounded-[50px] text-sm">
                        {technology}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TaskCard