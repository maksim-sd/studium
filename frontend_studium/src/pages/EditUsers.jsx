import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'

function AskModal ({ onClose }) {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[30%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex rounded-md bg-white flex-col gap-6.25">
                    <div className="flex flex-col justify-between">
                        <div onClick={onClose} className="self-end hover:font-bold cursor-pointer">
                            ✖
                        </div>
                        <div className="text-lg font-bold self-center text-red-700">
                            Удаление участника
                        </div>
                    </div>
                    <div className="text-center">
                        Вы уверены, что хотите удалить <span className='font-bold'>[Имя пользователя]</span>?
                    </div>
                    <div className="text-gray-500 text-sm text-center">
                        После удаления участнику больше не будет доступен общий чат проекта
                    </div>
                    <div className="flex justify-between mx-10">
                        <div className="cursor-pointer self-center rounded-md outline-2 outline-green-700 outline:bg-green-800 active:outline-green-900 px-6 py-1.5" onClick={onClose}>
                            Отмена
                        </div>
                        <div className="cursor-pointer self-center rounded-md text-white bg-red-700 hover:bg-red-800 active:bg-red-900 px-6 py-1.5" onClick={onClose}>
                            Удалить
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )   
}

function PaginatedTable ({ type, data, onAddUser, participants }) {  
    const [selectedUsers, setSelectedUsers] = useState(new Set())

    const { taskId } = useParams()

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const sortedData = [...data].sort((a, b) => {
        if (sortConfig !== null) {
            const { key, direction } = sortConfig;
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
        }
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    }

    const toggleUser = (id) => {
        const newSelected = new Set(selectedUsers)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedUsers(newSelected)
    }
 
    return (
        <div className="flex flex-col min-h-[70vh]">
            <table className="table-fixed w-full mt-5 text-left border-collapse border border-gray-300">
                <thead className="bg-green-700">
                    {type === 'exec' && 
                        <tr>
                            <th onClick={() => handleSort('name')} className="w-[60%] border border-white text-white px-6 py-3 font-medium cursor-pointer">ФИО исполнителя {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                            {/* <th onClick={() => handleSort('faculty')} className="w-[15%] border border-white text-white px-6 py-3 font-medium cursor-pointer">Факультет {sortConfig.key === 'faculty' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                            <th onClick={() => handleSort('speciality')} className="w-[20%] border border-white text-white px-6 py-3 font-medium cursor-pointer">Специальность {sortConfig.key === 'speciality' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th> */}
                            <th onClick={() => handleSort('group')} className="w-[15%] border border-white text-white px-6 py-3 font-medium cursor-pointer">Группа {sortConfig.key === 'group' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                            <th className="w-[15%] border border-white text-white px-6 py-3 font-medium">Действие</th>
                        </tr>
                    }
                    {type === 'moder' && 
                        <tr>
                            <th onClick={() => handleSort('name')} className="border border-white text-white px-6 py-3 font-medium cursor-pointer">ФИО модератора {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '🔼' : '🔽')}</th>
                            <th className="w-[15%] border border-white text-white px-6 py-3 font-medium">Действие</th>
                        </tr>
                    }
                </thead>
                {type === 'exec' && 
                    <tbody>
                        {currentItems.map((person, index) => {
                            const isChecked = selectedUsers.has(person.id)
                            return (
                                <tr key={person.id} className="hover:bg-gray-100 text-sm">
                                    <td className="border border-gray-300 px-6 py-3">{person.last_name} {person.first_name} {person.patronymic}</td>
                                    {/* <td className="border border-gray-300 px-6 py-3">{person.faculty}</td>
                                    <td className="border border-gray-300 px-6 py-3">{person.speciality}</td> */}
                                    <td className="border border-gray-300 px-6 py-3">{person.study_group}</td>
                                    <td className="border border-gray-300 px-6 py-3 text-center">
                                        <button key={person.id} 
                                            onClick={() => onAddUser(person.id, "executor")} 
                                            className={`w-23.5 h-7 flex justify-center items-center cursor-pointer px-3 py-1.5 rounded-md ${
                                                isChecked ? "box-border border-2 border-red-600 hover:border-red-700" : 'text-white bg-green-700 hover:bg-green-800'}`}
                                        >
                                            { isChecked ? "Удалить" : "Добавить" }
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                }
                {type === 'moder' && 
                    <tbody>
                        {currentItems.map((person, index) => {
                            const isChecked = selectedUsers.has(person.id)
                            return (
                                <tr key={person.id} className="hover:bg-gray-50 text-sm">
                                    <td className="border border-gray-300 px-6 py-3">{person.last_name} {person.first_name} {person.patronymic}</td>
                                    <td className="border border-gray-300 px-6 py-3">
                                        <button key={person.id} 
                                            onClick={() => onAddUser(person.id, "moderator")} 
                                            className={`w-23.5 h-7 flex justify-center items-center cursor-pointer px-3 py-1.5 rounded-md ${
                                                isChecked ? "box-border border-2 border-red-600 hover:border-red-700" : 'text-white bg-green-700 hover:bg-green-800'}`}
                                        >
                                            { isChecked ? "Удалить" : "Добавить" }
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                }    
            </table>

            <div className="flex justify-between items-center mt-auto">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 disabled:opacity-50 cursor-pointer"
                >
                    Назад
                </button>
                <div className="text-gray-700">
                    Страница {currentPage} из {Math.ceil(data.length / itemsPerPage)}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 disabled:opacity-50 cursor-pointer"
                >
                    Далее
                </button>
            </div>
        </div>
    );
}

function EditUsers () {
    const navigate = useNavigate()
    const user = useUserStore((state) => state.currentUser)

    const [participants, setParticipants] = useState([])

    const [moderators, setModerators] = useState([])
    const [executors, setExecutors] = useState([])

    const { taskId } = useParams()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleAddUser = async (userId, group) => {
        try {
            const response = await fetch(`/api/project_exchange/${taskId}/${group}/${userId}/`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (!response.ok) {
                console.error('Ошибка при добавлении')
            }
        } catch (error) {
            console.error('Ошибка при обращении к серверу')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) return

        try {
            const response = await fetch(`/api/project_exchange/${taskId}/user/${userId}/`, {
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

    const [activeTab, setActiveTab] = useState('tab1')

    const tabs = [
        {id: 'tab1', label: 'Исполнители'},
        {id: 'tab2', label: 'Модераторы'},
    ]

    const tabContent = {
        tab1: (
            <PaginatedTable type={'exec'} data={executors} onAddUser={handleAddUser} participants={participants} />
        ),
        tab2: (
            <PaginatedTable type={'moder'} data={moderators} onAddUser={handleAddUser} participants={participants} />
        )
    }

    useEffect(() => {
        async function fetchParticipants() {
            const response = await fetch(`/api/project_exchange/${taskId}/participants/`, {
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

        async function fetchUsers() {
            try {
                const [responseExec, responseModers] = await Promise.all([
                    fetch(`/api/project_exchange/${taskId}/executors/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Basic ${user}` }
                    }),
                    fetch(`/api/project_exchange/${taskId}/moderators/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Basic ${user}` }
                    })
                ])
                if (responseExec.ok && responseModers.ok) {
                    const dataExec = await responseExec.json()
                    const dataModer = await responseModers.json()
                        
                    setExecutors(dataExec)
                    setModerators(dataModer)
                } else {
                    console.error('Ошибка при получении данных')
                }
            } catch (error) {
                console.error('Ошибка при получении данных')
            }
        }

        if (taskId && user) {
            fetchParticipants()
            fetchUsers()
        }

        const intervalId = setInterval(() => {
            if (taskId && user) {
                fetchParticipants()
                fetchUsers()
            }
        }, 5000)

        return () => clearInterval(intervalId)
        
    }, [user, taskId])

    return (
        <>
            <div className="mx-62.5 min-h-[85vh]">
                <div className="text-3xl font-semibold pb-10">
                    Изменить состав участников проекта
                    {/* Изменить состав участников проекта Разработка программного приложения */}
                </div>
                <div className="flex gap-10">
                    <div className="basis-3/4">
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
                            <div className="mb-2">
                                <div className="flex bg-white outline outline-gray-400 rounded-md focus-within:outline-green-600">
                                    <input type="text" placeholder='Искать по имени...' className='bg-white outline-transparent rounded-md p-1.25' onChange={(e) => testData.filter(data => data.name.toLowerCase().includes(e.target.value.toLowerCase()))} />
                                    <div className="px-2.5 py-2 cursor-pointer">
                                        🔍
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {tabContent[activeTab]}
                        </div>
                    </div>
                    <div className="basis-1/4">
                        <div className="flex flex-col min-h-[70vh]">
                            <div className="text-lg font-bold self-center pb-5">
                                Текущие участники проекта:
                            </div>
                            <div className="flex flex-col">
                                <div className="border-b border-gray-400 pb-2.5">
                                    Заказчик:
                                    <div className="pl-2.5 py-4 text-sm">
                                        {participants.customer?.last_name} {participants.customer?.first_name}
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
                                                <div onClick={() => handleDeleteUser(person.id)} className={`cursor-pointer`}>
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
                                                <div onClick={() => handleDeleteUser(person.id)} className={`cursor-pointer`}>
                                                    ❌
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="self-center mt-auto mb-7.5">
                                <div onClick={() => navigate('/chats')} className="px-9 py-3 cursor-pointer rounded-md text-white text-lg font-bold bg-green-700 hover:bg-green-800 active:bg-green-900">
                                    Вернуться к чату
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && <AskModal onClose={closeModal} />}

        </>
    )
}

export default EditUsers