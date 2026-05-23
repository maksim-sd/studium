import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/UserStore'

function NavigationPanel ({ userRole }) {
    const navigate = useNavigate()
    const logoutUser = useUserStore((state) => state.logoutUser)

    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = (event) => {
        event.preventDefault()

        logoutUser()

        navigate('/login')
    }

    return (
        <nav className="flex w-full justify-between items-center">
                <div className="text-2xl font-bold">
                    Studium
                </div>

                   
                <div className="hidden md:flex space-x-6">
                    <a href="/profile" className="hover:text-green-700">Профиль</a>
                    <a href="/tasks" className="hover:text-green-700">Проекты</a>
                    <a href="/chats" className='hover:text-green-700'>Чаты</a>
                    {userRole === '3' &&
                        <a href="/studium-store" className='hover:text-green-700'>Магазин</a>
                    }
                </div>

                <div className="flex gap-7">
                    $ 0
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
                <NavigationPanel userRole={user.groups_id[0]} />
            }
        </header>
    )
}

export default Header