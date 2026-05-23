import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

function PaginatedTable ({ type }) {  
    const [selectedUsers, setSelectedUsers] = useState(new Set())

    const [testData, setTestData] = useState([
        { id: 1, name: 'Someone A', faculty: 'ЭФ', speciality: 'Software Developer', group: 'ПИ-22' },
        { id: 2, name: 'Someone B', faculty: 'ФФКиС', speciality: 'Product Manager', group: 'ПИ-23' },
        { id: 3, name: 'Someone C', faculty: 'ЭФ', speciality: 'UI/UX Designer', group: 'ПИ-24' },
        { id: 4, name: 'Someone D', faculty: 'ГФ', speciality: 'Project Manager', group: 'ПИ-25' },
        { id: 5, name: 'Someone E', faculty: 'ГФ', speciality: 'Engineer', group: 'ПИ-22' },
        { id: 6, name: 'Someone F', faculty: 'ИФФ', speciality: 'Data Scientist', group: 'ПИ-27' },
        { id: 7, name: 'Someone G', faculty: 'МФПиБ', speciality: 'Scientist', group: 'ПИ-16' },
        { id: 8, name: 'Someone H', faculty: 'МФПиБ', speciality: 'Architect', group: 'ПИ-45' },
        { id: 9, name: 'Someone I', faculty: 'ИФФ', speciality: 'Manager', group: 'ПИ-34' },
        { id: 10, name: 'Someone J', faculty: 'ГФ', speciality: 'HR Specialist', group: 'ПИ-34' },
        { id: 11, name: 'Someone K', faculty: 'МФПиБ', speciality: 'Data Scientist', group: 'ПИ-78' },
        { id: 12, name: 'Someone L', faculty: 'ГФ', speciality: 'Scientist', group: 'ПИ-22' },
        { id: 13, name: 'Someone M', faculty: 'ИФФ', speciality: 'Architect', group: 'ПИ-33' },
        { id: 14, name: 'Someone N', faculty: 'МФПиБ', speciality: 'Manager', group: 'ПИ-55' },
        { id: 15, name: 'Someone O', faculty: 'ИФФ', speciality: 'HR Specialist', group: 'ПИ-77' },
    ])

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });

    const sortedData = [...testData].sort((a, b) => {
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
                                    <td className="border border-gray-300 px-6 py-3">{person.name}</td>
                                    {/* <td className="border border-gray-300 px-6 py-3">{person.faculty}</td>
                                    <td className="border border-gray-300 px-6 py-3">{person.speciality}</td> */}
                                    <td className="border border-gray-300 px-6 py-3">{person.group}</td>
                                    <td className="border border-gray-300 px-6 py-3 text-center">
                                        <button key={person.id} 
                                            onClick={() => toggleUser(person.id)} 
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
                                    <td className="border border-gray-300 px-6 py-3">{person.name}</td>
                                    <td className="border border-gray-300 px-6 py-3">
                                        <button key={person.id} 
                                            onClick={() => toggleUser(person.id)} 
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

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-auto">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800 disabled:opacity-50 cursor-pointer"
                >
                    Назад
                </button>
                <div className="text-gray-700">
                    Страница {currentPage} из {Math.ceil(testData.length / itemsPerPage)}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(testData.length / itemsPerPage)}
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

    const [isModalOpen, setIsModalOpen] = useState(false)

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const [activeTab, setActiveTab] = useState('tab1')

    const tabs = [
        {id: 'tab1', label: 'Исполнители'},
        {id: 'tab2', label: 'Модераторы'},
    ]

    const tabContent = {
        tab1: (
            <PaginatedTable type={'exec'} />
        ),
        tab2: (
            <PaginatedTable type={'moder'} />
        )
    }

    return (
        <>
            <div className="mx-62.5 min-h-[85vh]">
                <div className="text-3xl font-semibold pb-10">
                    Изменить состав участников проекта Разработка программного приложения
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
                        <div class="overflow-x-auto">
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
                                        [Фамилия Имя заказчика]
                                    </div>
                                </div>
                                <div className="border-b border-gray-400 pt-5 pb-2.5">
                                    Модераторы:
                                    <ul className='pl-2.5 text-sm'>
                                        <li className='flex justify-between py-4'>
                                            <div className="">
                                                Модератор Модераторов
                                            </div>
                                            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                                                ❌
                                            </div>
                                        </li>
                                        <li className='flex justify-between py-4'>
                                            <div className="">
                                                Модератор Модераторов
                                            </div>
                                            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                                                ❌
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-5 pb-2.5">
                                    Исполнители:
                                    <ul className='pl-2.5 text-sm'>
                                        <li className='flex justify-between py-4'>
                                            <div className="">
                                                Исполнитель Исполнителов
                                            </div>
                                            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                                                ❌
                                            </div>
                                        </li>
                                        <li className='flex justify-between py-4'>
                                            <div className="">
                                                Исполнитель Исполнителов
                                            </div>
                                            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                                                ❌
                                            </div>
                                        </li>
                                        <li className='flex justify-between py-4'>
                                            <div className="">
                                                Исполнитель Исполнителов
                                            </div>
                                            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                                                ❌
                                            </div>
                                        </li>
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