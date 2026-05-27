import { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from "../store/UserStore"
import { useTechnologiesStore } from "../store/TechnologiesStore"
import { useProjectCategoryStore } from "../store/ProjectCategoryStore"
import { useUser } from "../userContext"


function TaskModal ({ onClose, type }) {
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [subtext, setSubtext] = useState('')

    useEffect (() => {
        switch (type) {
            case 'create':
                setTitle('Задача была создана!')
                setText('После прохождения модерации, задача станет доступна исполнителям')
                setSubtext('Созданную задачу Вы сможете найти в разделе "На модерации". Задача останется доступной для редактирования')
                break
            case 'moderate':
                setTitle('Задача была опубликована!')
                setText('Теперь задача доступна исполнителям')
                setSubtext('Задачу Вы сможете найти в разделе "Текущие проекты". Задача останется доступной для редактирования')
                break
            case 'edit':
                setTitle('Задача была изменена!')
                setText('Теперь внесенные изменения доступны исполнителям')
                setSubtext('Задачу Вы сможете найти в разделе "Текущие проекты". Задача останется доступной для редактирования')
                break
        }
    }, [])
    

    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[90%] md:w-[35%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 rounded-md flex text-center bg-white flex-col gap-6.25">
                    <div className="text-lg self-center">
                        { title }
                    </div>
                    <div className="leading-5">
                        { text }
                    </div>
                    <div className="text-gray-500 text-sm">
                        { subtext }
                    </div>
                    <div className="cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={onClose}>
                        Понятно
                    </div>
                </div>
            </div>
        </div>
    )   
}

function CreateNewTask ({ type }) {
    const [text, setText] = useState('')

    const { taskId } = useParams()

    const today = new Date().toISOString().split('T')[0]

    const user = useUserStore((state) => state.currentUser)
    const categories = useProjectCategoryStore((state) => state.categories)
    const technologies = useTechnologiesStore((state) => state.technologies)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [technology, setTechnology] = useState([])
    const [cashReward, setCashReward] = useState(false)
    const [pointsNumber, setPointsNumber] = useState(1)
    const [dueDate, setDueDate] = useState('')
    const [selectedFiles, setSelectedFiles] = useState([])

    const [currentTech, setCurrrentTech] = useState([])

    const [url, setUrl] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0)

        switch (type) {
            case 'create':
                setText('Отправить на проверку модератору')
                break
            case 'moderate':
                setText('Опубликовать задачу')
                break
            case 'edit':
                setText('Опубликовать изменения')
                break
        }

        async function fetchProject() {
            const response = await fetch(`/api/project_exchange/${taskId}/`, {
				method: 'GET',
				headers: {
					'Authorization': `Basic ${user}`
				}
			})
            if (response.ok) {
                const data = await response.json()

                setName(data.name)
                setDescription(data.description)
                setCategory(data.category_project_id)
                setTechnology(data.technologies_id)
                setCashReward(data.cash_reward)
                setPointsNumber(data.number_of_points)
                setDueDate(data.due_date)
                setCurrrentTech(data.technologies_id)

            }
        }

        if (type === 'edit' || type === 'moderate') {
            fetchProject()
        }
    }, [])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const closeModal = () => {
        setIsModalOpen(false)
        navigate('/profile')
    }

    
    const fileInputRef = useRef(null)

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)

        const uniqueNewFiles = files.filter(
            (newFile) => !selectedFiles.some((oldFile) => oldFile.name === newFile.name)
        )

        const updatedFiles = [...selectedFiles, ...uniqueNewFiles]

        setSelectedFiles(updatedFiles)
        syncInputFiles(updatedFiles)
    }

    const removeFile = (fileName) => {
        const updatedFiles = selectedFiles.filter((file) => file.name !== fileName)
        setSelectedFiles(updatedFiles)
        syncInputFiles(updatedFiles)        
    }

    const syncInputFiles = (files) => {
        const dataTransfer = new DataTransfer()

        files.forEach((file) => dataTransfer.items.add(file))

        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files
        }
    }

    const handleCreate = async (e) => {
        const data = {
            "category_project_id": category,
            "technologies_id": technology,
            "name": name,
            "description": description,
            "cash_reward": cashReward,
            "number_of_points": pointsNumber,
            "due_date": dueDate
        }

        const formData = new FormData()
        formData.append('payload', JSON.stringify(data))

        if (selectedFiles && selectedFiles.length > 0) {
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i])
            }
        }

        const response = await fetch(`/api/project_exchange/`, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${user}`,
			},
            body: formData
		})

        if (response.ok) {
            setIsModalOpen(true)
        }
    }

    const handleChanges = async (e) => {
        const data = {
            "new_category_project_id": category,
            "new_name": name,
            "new_technologies_id": technology,
            "new_number_of_points": pointsNumber,
            "delete_files_id": [],
            "new_due_date": dueDate,
            "delete_technologies_id": currentTech.filter(item => !technology.includes(item)),
            "new_cash_reward": cashReward,
            "new_description": description
        }

        const formData = new FormData()
        formData.append('payload', JSON.stringify(data))

        if (type === 'moderate') {
            setUrl(`/api/project_exchange/${taskId}/publish/`)
        } else {
            setUrl(`/api/project_exchange/${taskId}/`)
        }

        const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Authorization': `Basic ${user}`,
			},
            body: formData
		})


        if (response.ok) {
            setIsModalOpen(true)
        }
    }

    return (
        <>
            <div className="mx-5 md:mx-62.5 flex flex-col">
                <div className="text-2xl md:text-3xl font-semibold mb-8.75">
                    {type === 'create' ? 'Создание новой задачи' : 'Редактирование задачи'}
                </div>
                <div className="flex flex-col gap-10 pb-12.5">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Название задачи
                        </div>
                        <div className="basis-3/4">
                            <input 
                                type="text" 
                                className="bg-white outline outline-gray-400 rounded-md focus:outline-green-600 p-1.25 w-full"
                                value={name ?? ""}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                            <div className="text-sm text-gray-500 mt-2.5">
                                В названии постарайтесь указать основную суть проекта. Например, "Веб-приложение для ветеринарной клиники"
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Описание задачи
                        </div>
                        <div className="basis-3/4">
                            <textarea 
                                name="" 
                                id="" 
                                rows='15' 
                                className="bg-white outline outline-gray-400 focus:outline-green-600 rounded-md w-full p-1.25"
                                value={description ?? ""}
                                onChange={(e) => setDescription(e.target.value)}
                                required 
                            />
                            <div className="text-sm text-gray-500 mt-2.5">
                                Расскажите, какой продукт Вы хотите получить? Какими функциями он должен обладать?
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Категория
                        </div>
                        <div className="basis-3/4">
                            <div className="flex gap-2.5 flex-wrap">
                                {categories.map((item) => (
                                    <div key={item.id} className=" relative block">
                                        <input 
                                            type="radio" 
                                            name="category" 
                                            id={`category${item.id}`} 
                                            className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600"
                                            checked={item.id === category}
                                            value={item.id}
                                            onChange={(e) => setCategory(item.id)}
                                            required
                                        />
                                        <label htmlFor={`category${item.id}`} className="cursor-pointer px-3 md:px-3.5 py-1.5 rounded-[50px] font-normal inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
                                            {item.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-2.5">
                                Укажите, какой продукт хотите получить
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Технологии
                        </div>
                        <div className="basis-3/4">
                            <div className="flex gap-2.5 flex-wrap">
                                {technologies.map((item) => (
                                    <div key={item.id} className="relative block">
                                        <input 
                                            type="checkbox" 
                                            name="technology" 
                                            id={`technology${item.id}`} 
                                            checked={technology.includes(item.id)}
                                            className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" 
                                            onChange={(e) => {
                                                if (technology.includes(item.id)) {
                                                    setTechnology(technology.filter(id => id !== item.id))
                                                } else {
                                                    setTechnology([...technology, item.id])
                                                }
                                            }}
                                            required
                                        />
                                        <label htmlFor={`technology${item.id}`} className="cursor-pointer px-3 md:px-3.5 py-1.5 rounded-[50px] font-normal inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
                                            {item.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-2.5">
                                Выберите пункты, соответствующие задаче
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Вознаграждение
                        </div>
                        <div className="basis-3/4 flex flex-col">
                            <div className="flex md:gap-15 flex-col md:flex-row">
                                <div className="">
                                    <input 
                                        type="number" 
                                        min='1' 
                                        className="peer w-full bg-white outline outline-gray-400 rounded-md focus:outline-green-600 p-1.25 invalid:outline-red-500" 
                                        value={pointsNumber ?? 1}
                                        onChange={(e) => setPointsNumber(e.target.value)}
                                        required 
                                    />
                                    <p className="hidden peer-invalid:block text-sm text-red-500">
                                        Сумма вознаграждения не может быть равной нулю
                                    </p>
                                </div>
                                <div className="flex items-start gap-5 flex-col md:flex-row">
                                    <div className="pt-1.25 flex gap-1.5">
                                        <input 
                                            type="checkbox" 
                                            checked={cashReward} 
                                            onChange={(e) => setCashReward(e.target.checked)} 
                                            name="" 
                                            id="" 
                                            className="h-5 w-5 rounded border-gray-400 accent-green-700 cursor-pointer" 
                                        />
                                        <label htmlFor="">Денежное вознаграждение</label>
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-2.5">
                                Укажите сумму вознаграждения во внутренней валюте онлайн-платформы, которое получит исполнитель в случае успешного завершения задачи. Вы также можете указать наличие денежного вознаграждения
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Срок выполнения
                        </div>
                        <div className="basis-3/4">
                            <input 
                                type="date" 
                                min={today} 
                                className="bg-white w-full md:w-[20%] outline outline-gray-400 rounded-md focus:outline-green-600 p-1.25" 
                                value={dueDate ?? ""}
                                onChange={(e) => setDueDate(e.target.value)}
                                required 
                            />
                            <div className="text-sm text-gray-500 mt-2.5">
                                Укажите дату, до которой необходимо выполнить данную задачу
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                        <div className="text-base font-semibold md:font-normal md:text-lg basis-1/4">
                            Дополнительные материалы
                        </div>
                        <div className="basis-3/4">
                            <div 
                                onClick={triggerFileInput} 
                                className="w-fit cursor-pointer text-white rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 px-4 py-2"
                            >
                                Добавить файлы
                            </div>
                            <div className="text-sm text-gray-500 mt-2.5">
                                Если у Вас есть материалы, относящиеся к создаваемому проекту, то Вы можете прикрепить их здесь
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileChange}
                                multiple
                            />
                            {selectedFiles.length > 0 &&
                                <div className="pt-3.75">
                                    <div className="text-sm font-medium text-gray-900 mb-2">
                                        Прикрепленные файлы ({selectedFiles.length}):
                                    </div>
                                    <ul className="border-t border-gray-200 py-2">
                                        {selectedFiles.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between py-3 text-sm text-gray-700 not-last:border-b not-last:border-b-gray-300">
                                            <div className="flex items-center truncate">
                                                📄
                                                <span className="truncate">{file.name}</span>
                                            </div>
                                            <button
                                                onClick={() => removeFile(file.name)}
                                                className="cursor-pointer ml-4 font-medium text-red-600 hover:text-red-500"
                                            >
                                                Удалить
                                            </button>
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="mb-5 text-base md:text-lg self-center">
                    <button 
                        className="text-white rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 cursor-pointer self-center px-8.75 py-3.75 font-bold" 
                        onClick={type === 'create' ? handleCreate : handleChanges}
                    >
                        { text }
                    </button>
                </div>
            </div>

            {isModalOpen && <TaskModal onClose={closeModal} type={type} />}

        </>
    )
}

export default CreateNewTask