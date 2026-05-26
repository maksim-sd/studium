import { useRef, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormatDate } from '../shared/FormatDate'
import { useUserStore } from '../store/UserStore'

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
                if (!response.ok) {
                    throw new Error('Error!!!')
                }

                const data = await response.json()

                if (mountedRef.current) {
                    setChatMessage(data)
                    await fetchMessages()
                }
            } catch (err) {
                if (err.name !== 'AbortError' && mountedRef.current) {
                    setError(err.message)
                    setTimeout(() => fetchMessages(), 5000)
                }
            }
        }
        fetchMessages()

        return () => {
            mountedRef.current = false
            abortController.abort()
        }

        if (error) {
            return (
                <div className="">
                    Ошибка
                </div>
            )
        }

        if (!chatMessages) {
            return (
                <div className="">
                    Ожидание данных...
                </div>
            )
        }
    }, [chatId])

    return (
        <div className="p-2.5 flex flex-col gap-2">
            {[...chatMessages].reverse().map((message) => {
                if (message.user.id === userId) {
                    return (
                        <div className="self-end">
                            <div className="flex flex-col w-fit bg-green-700 text-white px-3 py-1.5 rounded-l-full rounded-t-full">
                                {message.message}
                                <div className="self-end text-xs pt-2">
                                    {FormatDate(message.created_at)}
                                </div>
                            </div>
                            
                        </div>
                        
                    )
                } else {
                    return (
                        <div className="">
                            <div className="text-sm text-gray-600 pb-1">
                                {message.user.last_name} {message.user.first_name}
                            </div>
                            <div className="flex flex-col self-start bg-white px-3 py-1.5 rounded-r-full rounded-t-full w-fit">
                                {message.message}
                                <div className="self-start text-xs pt-2">
                                    {FormatDate(message.created_at)}
                                </div>
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}

function Chats() {
    const user = useUserStore((state) => state.currentUser)
    const userData = useUserStore((state) => state.currentUserData)
    const userGroup = useUserStore((state) => state.groups)
    const navigate = useNavigate()

    const { chatId } = useParams()

    const [userChats, setUserChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)

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

        if (message.trim()) {
            const data = {
                'message': message,
            }

            const formData = new FormData()
            formData.append('payload', JSON.stringify(data))

            const response = await fetch(`/api/project_exchange/chat/${chatId}/message/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${user}`,
                },
                body: formData
            })

            setMessage('');
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
            }
        } 
        fetchUserChats()
    }, [user, chatId])

    return (
        <div className="mx-5 md:mx-62.5 flex gap-7.5 pb-10">
            <div className="basis-1/4 flex flex-col gap-3 p-2.5 h-[80vh] outline outline-gray-300 rounded-md">
                {/* <div className="">
                    <input type="text" className="bg-white outline outline-gray-400 focus:outline-green-600 rounded-md w-full p-1.25" placeholder="Поиск среди чатов..." />
                </div> */}
                <div className="text-lg text-center border-b border-b-gray-300 pb-2">
                    Список чатов
                </div>
                {userChats.length > 0 ? (
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
                )}
            </div>
            {chatId === undefined ? (
                <div className="basis-3/4 bg-gray-200 flex flex-col outline outline-gray-300 rounded-md">
                    <div className="self-center mt-40 text-xl">
                        Выберите чат
                    </div>
                </div>
            ) : (
                <div className="basis-3/4 bg-gray-200 flex flex-col outline outline-gray-300 rounded-md">
                    <div className="flex justify-between bg-white p-2.5 items-center gap-5 border-b border-gray-200">
                        <div className="flex items-center pl-5">
                            <div className="flex flex-col gap-1.5">
                                <div title='Перейти к деталям проекта' className="text-[18px] cursor-pointer" onClick={() => navigate(`/tasks/${currentChat.project?.id}`)} >
                                    {currentChat ? currentChat.project.name : '...'}
                                </div>
                                <div className="text-sm cursor-pointer" onClick={() => navigate(`/tasks/${currentChat.project?.id}/edit-users`)} >
                                    Участники чата
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
                                            href="/tasks/1"
                                            className="text-gray-700 block px-4 py-2 text-sm"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Перейти к задаче
                                        </a>
                                    </div>
                                    <div className="py-1 hover:font-semibold">
                                        <a
                                            key={2}
                                            href="/tasks/1/edit-users"
                                            className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Изменить участников
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                    </div>
                    <Messenger chatId={chatId} user={user} userId={userData.id} />
                    {/* <div className="p-2.5 flex flex-col gap-2">
                        <div className="self-end bg-green-700 text-white px-3 py-1.5 rounded-l-full rounded-t-full">
                            Привет!
                        </div>
                        <div className="self-end bg-green-700 text-white px-3 py-1.5 rounded-l-full rounded-t-full">
                            Я здесь только для того, чтобы показать визуал
                        </div>
                        <div className="self-start bg-white px-3 py-1.5 rounded-r-full rounded-t-full">
                            Привет! Хорошо
                        </div>
                    </div> */}
                    <div className="flex items-center gap-2.5 rounded-2xl bg-white mt-auto p-2.5 border-10 border-gray-200">
                        <div className="self-end mb-2.5 cursor-pointer">
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