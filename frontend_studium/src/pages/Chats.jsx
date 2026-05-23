import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../userContext';

function Chats() {
    const { user } = useUser()
    const navigate = useNavigate()

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

    const handleSend = () => {
        if (message.trim()) {
        console.log('Отправлено:', message);
        setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    const options = ['Профиль', 'Настройки', 'Выйти'];

    return (
        <div className="mx-5 md:mx-62.5 flex gap-7.5 pb-10">
            <div className="basis-1/4 flex flex-col gap-3 p-2.5 h-[80vh] outline outline-gray-300 rounded-md">
                {/* <div className="">
                    <input type="text" className="bg-white outline outline-gray-400 focus:outline-green-600 rounded-md w-full p-1.25" placeholder="Поиск среди чатов..." />
                </div> */}
                <div className="text-lg text-center border-b border-b-gray-300 pb-2">
                    Список чатов
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="cursor-pointer bg-white flex gap-2.5 p-2.5 border-b border-gray-200">
                        <div className="flex flex-col gap-1.25">
                            <div className="flex">
                                <div title="Разработка программного приложения" className="line-clamp-2 text-green-700 font-bold">
                                    Разработка программного приложения
                                </div>
                                <div className="text-xs">
                                    hh.mm
                                </div>
                            </div>
                            <div className="flex gap-2.5 text-sm line-clamp-2">
                                <p className="text-sm leading-[1.3] line-clamp-2 h-9">
                                    <span className="text-gray-400">Автор: </span>Текст сообщения Текст сообщения Текст сообщения Текст сообщения Текст сообщения
                                </p>
                                <div className="hidden">
                                    <div className="bg-gray-500 w-5 h-5 rounded-full content-center text-center">
                                        1
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cursor-pointer  bg-white flex gap-2.5 p-2.5 border-b border-gray-200">
                        <div className="flex flex-col gap-1.25">
                            <div className="flex">
                                <div className="line-clamp-2 text-green-700 font-bold">
                                    Разработка программного приложения
                                </div>
                                <div className="text-xs">
                                    hh.mm
                                </div>
                            </div>
                            <div className="flex gap-2.5 text-sm line-clamp-2">
                                <p className="text-sm leading-[1.3] line-clamp-2 h-9">
                                    <span className="text-gray-400">Автор: </span>Текст сообщения Текст сообщения Текст сообщения Текст сообщения Текст сообщения
                                </p>
                                <div className="">
                                    <div className="bg-green-600 text-white w-5 h-5 rounded-full content-center text-center">
                                        1
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="basis-3/4 bg-gray-200 flex flex-col outline outline-gray-300 rounded-md">
                <div className="flex justify-between bg-white p-2.5 items-center gap-5 border-b border-gray-200">
                    <div className="flex items-center pl-5">
                        <div className="flex flex-col gap-1.5">
                            <div title='Перейти к деталям проекта' className="text-[18px] cursor-pointer" onClick={() => navigate('/tasks/1')} >
                                Разработка программного приложения
                            </div>
                            <div className="text-sm cursor-pointer" onClick={() => navigate('/tasks/1/edit-users')} >
                                Участники чата
                            </div>
                        </div>
                    </div>
                    {user.role !== 'student' &&
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
                <div className="p-2.5 flex flex-col gap-2">
                    <div className="self-end bg-green-700 text-white px-3 py-1.5 rounded-l-full rounded-t-full">
                        Привет!
                    </div>
                    <div className="self-end bg-green-700 text-white px-3 py-1.5 rounded-l-full rounded-t-full">
                        Я здесь только для того, чтобы показать визуал
                    </div>
                    <div className="self-start bg-white px-3 py-1.5 rounded-r-full rounded-t-full">
                        Привет! Хорошо
                    </div>
                </div>
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
                        <button className="cursor-pointer px-3.5 py-3 h-full self-end text-white bg-green-700 hover:bg-green-800 acrive:bg-green-900 rounded-full">
                            ➤
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Chats