import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'

function NavigationPanel () {
    const navigate = useNavigate()
    const logoutUser = useUserStore((state) => state.logoutUser)
    const user = useUserStore((state) => state.currentUserData)
    const userData = useUserStore((state) => state.currentUser)
    const userGroup = useUserStore((state) => state.groups)

    const [isOpen, setIsOpen] = useState(false)

    const [balance, setBalance] = useState(0)

    const handleLogout = (event) => {
        event.preventDefault()
        logoutUser()
        navigate('/login')
    }

    useEffect(() => {
        async function fetchBalance() {
            if (!userData) return

            const response = await fetch('/api/user/balance/', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${userData}`,
                }
            })
            if (response.ok) {
                const data = await response.json()
                setBalance(data.number_of_points)
            }
        }

        if (userGroup === "Исполнитель") {
            fetchBalance()
        }

        const intervalId = setInterval(() => {
            if (userGroup === "Исполнитель") {
                fetchBalance()
            }
        }, 300000)

        return () => clearInterval(intervalId)
    }, [userGroup, userData])

    return (
        <nav className="flex w-full justify-between items-center">
                <div className="text-2xl font-bold">
                    Стадиум
                </div>

                   
                <div className="hidden md:flex space-x-6">
                    <a href="/profile" className="hover:text-green-700">Профиль</a>
                    <a href="/tasks" className="hover:text-green-700">Проекты</a>
                    <a href="/chats" className='hover:text-green-700'>Чаты</a>
                    {userGroup === 'Исполнитель' &&
                        <a href="/studium-store" className='hover:text-green-700'>Магазин</a>
                    }
                </div>

                <div className="flex gap-7">
                    {/* <div className="">
                        {userGroup} ?
                    </div> */}
                    {/* <div title='Баланс пользователя во внутренней валюте' className={`${userGroup === "Исполнитель" ? '' : 'hidden'}`}>
                        {balance}🪙
                    </div> */}
                    <div onClick={handleLogout} className="text-red-600 font-bold cursor-pointer">
                        ➜]
                    </div>
                </div>

                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden focus:outline-none"
                    >
                    {isOpen ? '✕' : '☰'}
                </button>

                {isOpen && (
                    <div className="md:hidden pt-25 space-y-2 flex flex-col text-white bg-gray-800">
                        <a href="/profile" className="hover:text-gray-400">Профиль</a>
                        <a href="/tasks" className="hover:text-gray-400">Проекты</a>
                        {userRole === '3' &&
                            <a href="/users" className="hover:bg-gray-700">Пользователи</a>
                        }
                    </div>
                )}
            </nav>
    )
}

function Header () {
    const isAuth = useUserStore((state) => state.isAuth)
    const user = useUserStore((state) => state.currentUserData)

    return (
        <header className="h-12.5 md:px-26 px-5 flex mb-12.5 sticky top-0 z-1000 bg-white outline outline-gray-300">
            {!isAuth &&
                <div className="text-2xl font-bold self-center">
                    Studium
                </div>
            }

            {isAuth && 
                <NavigationPanel />
            }
        </header>
    )
}

export default Header