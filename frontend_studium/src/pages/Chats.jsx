import { useRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormatDate } from '../shared/FormatDate'
import { useUserStore } from '../store/UserStore'
import { chatApi } from '../api/chat'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css' 

function ChatPanel ({ chatInfo }) {
    const navigate = useNavigate()
    
    return (
        <div onClick={() => navigate(`/chats/${chatInfo.id}`)} className="cursor-pointer bg-white flex gap-2.5 p-2.5 border-b border-gray-200">
            <div className="flex flex-col gap-1.25">
                <div className="flex justify-between">
                    <div title={chatInfo.project.name} className="line-clamp-2 text-green-700 font-bold">
                        {chatInfo.project.name}
                    </div>
                    <div className="text-xs text-nowrap">
                        {chatInfo.last_message ? FormatDate(chatInfo.last_message?.created_at) : ''}
                    </div>
                </div>
                <div className="flex gap-2.5 text-sm line-clamp-2">
                    {chatInfo.last_message && 
                        <p className="text-sm leading-[1.3] line-clamp-2 h-9">
                            <span className="text-gray-400">{chatInfo.last_message?.user.last_name} {chatInfo.last_message?.user.first_name}: </span>{chatInfo.last_message?.message}
                        </p>
                    }
                    <div className="hidden">
                        <div className="bg-gray-500 w-5 h-5 rounded-full content-center text-center">
                            {chatInfo.unread_count}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Messenger ({ chatId, user, userId }) {
    const [chatMessages, setChatMessage] = useState([])
    const [error, setError] = useState(null)
    const mountedRef = useRef(true)

    const bottomRef = useRef()
    const fileInputRef = useRef(null)

    const [editingMessageId, setEditingMessageId] = useState(null)
    const [editText, setEditText] = useState('')
    const [editFiles, setEditFiles] = useState([])
    const [filesToDelete, setFilesToDelete] = useState([])

    const isEditable = (createdAtString) => {
        const createdAt = new Date(createdAtString)
        const now = new Date()
        const diffInHours = (now - createdAt) / (1000 * 60 * 60)
        return diffInHours < 24
    }

     const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const removeFile = (fileName) => {
        const updatedFiles = Object.values(editFiles).filter((file) => file.name !== fileName)
        setEditFiles(updatedFiles)
        syncInputFiles(updatedFiles)        
    }

    const syncInputFiles = (files) => {
        const dataTransfer = new DataTransfer()

        files.forEach((file) => dataTransfer.items.add(file))

        if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files
        }
    }

    const handleDelete = async (messageId) => {
        if (!window.confirm("Удалить сообщение?")) return;
        try {
            await chatApi.fetchDeleteMessages(messageId)
            setChatMessage(prev => prev.filter(msg => msg.id !== messageId))
        } catch (err) {
            alert(err.message)
        }
    }

    const startEdit = (message) => {
        setEditingMessageId(message.id)
        setEditText(message.message)
        setFilesToDelete([])
        setEditFiles([])
    }

    const handleUpdate = async (messageId) => {
        try {
            const formData = new FormData();

            const payload = {
                new_message: editText,
                delete_files_id: filesToDelete
            }
            
            formData.append('payload', JSON.stringify(payload))
            
            for (let i = 0; i < editFiles.length; i++) {
                formData.append('new_files', editFiles[i])
            }

            await chatApi.fetchUpdateMessages(messageId, formData)

            setEditingMessageId(null)
        } catch (err) {
            alert(err.message)
        }
    }

    useEffect(() => {
        mountedRef.current = true
        let abortController = new AbortController()

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/project_exchange/user/chat/${chatId}/messages/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${user}`
                    },
                    signal: abortController.signal,
                })

                if (!response.ok) throw new Error('Ошибка загрузки данных')
                const data = await response.json()

                if (mountedRef.current) {
                    setChatMessage(data)
                    setTimeout(() => {
                        if (mountedRef.current) fetchMessages()
                    }, 2000)
                }
            } catch (err) {
                if (err.name !== 'AbortError' && mountedRef.current) {
                    setError(err.message)
                    setTimeout(() => {
                        if (mountedRef.current) fetchMessages()
                    }, 5000)
                }
            }
        }

        fetchMessages();

        return () => {
            mountedRef.current = false
            abortController.abort()
        }
    }, [chatId, user])

    useEffect(() => {
        if (chatMessages && chatMessages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatMessages?.length])

    return (
    <>
        <div className="p-2.5 flex flex-col gap-4">
            {[...chatMessages].reverse().map((message) => {
                const isOwn = message.user.id === userId;
                const canModify = isOwn && isEditable(message.created_at);
                const isEditing = editingMessageId === message.id;

                return (
                    <div 
                        key={message.id} 
                        className={`group flex max-w-[75%] gap-3 items-end ${
                            isOwn ? "self-end flex-row" : "self-start flex-row-reverse"
                        }`}
                    >
                        {canModify && !isEditing && (
                            <div className="hidden group-hover:flex items-center gap-2 text-sm text-gray-400 select-none pb-1">
                                <button 
                                    onClick={() => startEdit(message)} 
                                    className="hover:text-blue-500 transition-colors cursor-pointer"
                                >
                                    Изменить
                                </button>
                                <button 
                                    onClick={() => handleDelete(message.id)} 
                                    className="hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    Удалить
                                </button>
                            </div>
                        )}

                        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                            {!isOwn && (
                                <div className="text-sm text-gray-500 pb-1 px-1">
                                    {message.user.last_name} {message.user.first_name}
                                </div>
                            )}

                            <div className={`flex flex-col p-3 rounded-t-xl min-w-[150px] ${
                                isOwn 
                                    ? "bg-green-700 text-white rounded-l-xl" 
                                    : "bg-white text-black rounded-r-xl border border-gray-200"
                            }`}>
                                {isEditing ? (
                                    <div className="flex flex-col gap-2 text-black">
                                        <textarea 
                                            className="p-1 border rounded text-sm w-full min-w-30 bg-white outline-none"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        
                                        {message.files?.length > 0 && (
                                            <div className={`text-sm flex flex-col gap-1 ${isOwn ? "text-green-100" : "text-gray-600"}`}>
                                                <div className="font-semibold opacity-85">Прикрепленные файлы:</div>
                                                {message.files.map(f => (
                                                    <label key={f.id} className="flex items-center gap-1.5 truncate max-w-100 cursor-pointer">
                                                        <span className={filesToDelete.includes(f.id) ? "line-through opacity-60" : ""}>
                                                            Удалить {f.file.split('/').pop()} ?
                                                        </span>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={filesToDelete.includes(f.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setFilesToDelete([...filesToDelete, f.id]);
                                                                else setFilesToDelete(filesToDelete.filter(id => id !== f.id));
                                                            }}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div 
                                            onClick={triggerFileInput} 
                                            className="w-fit text-sm cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md px-3 py-1.5 text-center font-medium transition-colors"
                                        >
                                            Добавить файлы
                                        </div>

                                        <input 
                                            type="file" 
                                            multiple 
                                            className="hidden"
                                            onChange={(e) => setEditFiles(e.target.files)}
                                            ref={fileInputRef}
                                        />

                                        {Object.values(editFiles).length > 0 &&
                                            <div className={`text-sm flex flex-col gap-1.5 ${isOwn ? "text-white" : "text-black"}`}>
                                                <div className="font-semibold opacity-85">Новые файлы:</div>
                                                <ul className="flex flex-col gap-1">
                                                    {Object.values(editFiles).map((file, index) => (
                                                        <li className="flex justify-between items-center bg-black/5 p-1 rounded gap-2" key={index}>
                                                            <div className="flex items-center truncate text-[11px]">
                                                                📄 <span className="truncate text-sm max-w-65 ml-1">{file.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(file.name)}
                                                                className="bg-gray-100 rounded-md px-3 py-0.5cursor-pointer font-semibold text-red-600 hover:text-red-500 text-[10px]"
                                                            >
                                                                Убрать
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        }
                                        <div className="flex gap-2 justify-end mt-1 border-t pt-2 border-black/10">
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingMessageId(null)} 
                                                className="text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 px-2.5 py-1 rounded cursor-pointer transition-colors"
                                            >
                                                Отмена
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleUpdate(message.id)} 
                                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded cursor-pointer transition-colors"
                                            >
                                                Сохранить
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="wrap-break-words">{message.message}</span>
                                        <span className={`self-end text-xs pt-1 ${isOwn ? "text-green-200" : "text-gray-400"}`}>
                                            {FormatDate(message.created_at)} {message.changed && '(изм.)'}
                                        </span>
                                    </>
                                )}

                                {!isEditing && message.files?.length > 0 && (
                                    <div className="mt-1.5 flex flex-col gap-1 w-full">
                                        {message.files.map((file, index) => (
                                            <div key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300 truncate max-w-62.5">
                                                <a href={file.file} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    📄 {file.file.split('/').pop() || 'Файл'}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="" ref={bottomRef}></div>
    </>
)
}

function Chats() {
    const user = useUserStore((state) => state.currentUser)
    const userData = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)

    const { chatId } = useParams()

    const [userChats, setUserChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [selectedFiles, setSelectedFiles] = useState([])

    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
        textarea.style.height = 'auto';
        const maxHeight = 200;
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }

    useEffect(() => {
        adjustHeight();
    }, [message]);

    const handleSend = async (e) => {
        if (e) {
            e.preventDefault()
        }

        if (message.trim() || selectedFiles.length > 0) {
            const formData = new FormData()

            if (message.trim()) {
                const data = {
                    'message': message,
                }

                formData.append('payload', JSON.stringify(data))
            }
            
            if (selectedFiles && selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    formData.append('files', selectedFiles[i])
                }
            }

            const response = await fetch(`/api/project_exchange/chat/${chatId}/message/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${user}`,
                },
                body: formData
            })

            setMessage('')
            setSelectedFiles([])
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend(e)
        }
    }

    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        async function fetchUserChats () {
            setIsLoading(true)
            const response = await fetch('/api/project_exchange/user/chats/', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${user}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUserChats(data)
                setCurrentChat(data.find((chat) => parseInt(chat.id, 10) === parseInt(chatId, 10)))
                setIsLoading(false)
            }
        } 
        fetchUserChats()
    }, [user, chatId])

    const fileInputRef = useRef(null)

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = async (e) => {
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

    return (
        <div className="mx-5 md:mx-62.5 flex gap-7.5 pb-10">
            <div className="basis-1/4 flex flex-col gap-3 p-2.5 h-[80vh] outline outline-gray-300 rounded-md">
                <div className="text-lg text-center border-b border-b-gray-300 pb-2">
                    Список чатов
                </div>
                {isLoading ? (
                    <div className="flex flex-col gap-2.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border border-gray-200 rounded-md p-2.5">
                                <Skeleton height={36} width="60%" className="mb-6" />
                                <Skeleton height={12} count={2} width="80%" className="mb-3" />
                            </div>
                        ))}
                    </div>
                ): (
                    userChats.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                            {userChats.map((chat) => (
                                <ChatPanel chatInfo={chat} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center mt-5">
                            <div className="">
                                У Вас пока нет активных чатов
                            </div>
                        </div>
                    )
                )}
                
            </div>
            {chatId === undefined ? (
                <div className="basis-3/4 bg-gray-200 flex flex-col outline outline-gray-300 rounded-md">
                    <div className="self-center mt-40 text-xl">
                        Выберите чат
                    </div>
                </div>
            ) : (
                <div className="basis-3/4 bg-gray-200 flex flex-col outline outline-gray-300 rounded-md h-[80vh]">
                    <div className="flex justify-between bg-white p-2.5 items-center gap-5 border-b border-gray-200">
                        <div className="flex items-center pl-5">
                            <div className="flex flex-col gap-1.5">
                                <div title='Перейти к деталям проекта' className="text-[18px] cursor-pointer" onClick={() => navigate(`/tasks/${currentChat.project?.id}`)} >
                                    {(!isLoading && currentChat) ? currentChat.project.name : <Skeleton width={260} height={24} />}
                                </div>
                                <div className="text-sm cursor-pointer" onClick={() => userGroup !== "Модератор" ? navigate(`/tasks/${currentChat.project?.id}`) : navigate(`/tasks/${currentChat.project?.id}/edit-users`)} >
                                    {isLoading ? <Skeleton width={130} height={12} /> : "Участники чата"}
                                </div>
                            </div>
                        </div>
                        {userGroup !== "Исполнитель" &&
                            <div onClick={() => setIsOpen(!isOpen)} className="mr-5 py-2 px-3.5 rounded-full text-white bg-green-700 hover:bg-green-800 cursor-pointer">
                                ⋮
                                {isOpen && (
                                <div className="origin-top-left absolute right-70 mt-4 w-56 rounded-md shadow-lg bg-white outline outline-green-700 focus:outline-none z-10">
                                    <div className="py-1 hover:font-semibold">
                                        <a
                                            key={1}
                                            href={`/tasks/${currentChat.project.id}`}
                                            className="text-gray-700 block px-4 py-2 text-sm"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Перейти к задаче
                                        </a>
                                    </div>
                                    {userGroup === "Модератор" &&
                                        <div className="py-1 hover:font-semibold">
                                            <a
                                                key={2}
                                                href={`/tasks/${currentChat.project.id}/edit-users`}
                                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Изменить участников
                                            </a>
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    }
                    </div>
                    <div className='h-70[vh] overflow-y-auto'>
                        <Messenger chatId={chatId} user={user} userId={userData.id}/>
                    </div>
                    
                    <div className="flex flex-col mt-auto w-full gap-2 px-2.5">
                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-700 shadow-sm">
                                        <span>📄</span>
                                        <span className="truncate max-w-37.5">{file.name}</span>
                                        <button 
                                            type="button"
                                            onClick={() => removeFile(file.name)} 
                                            className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 border-10 border-gray-200">
                        <div className="self-end mb-2.5">
                            <input
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                                className='hidden'
                                multiple
                            />
                        </div>
                        <div className="cursor-pointer" onClick={handleClick}>
                            🧷
                        </div>
                        <div className="flex w-full justify-between gap-2.5">
                            <textarea type="text" 
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите сообщение..." 
                            className="bg-white text-sm w-full p-2.5 field-sizing-fixed resize-none overflow-y-auto max-h-50 min-h-4 focus:outline-0" 
                            rows={1} />
                            <button onClick={(e) => handleSend()} className="cursor-pointer px-3.5 py-3 h-full self-end text-white bg-green-700 hover:bg-green-800 acrive:bg-green-900 rounded-full">
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chats