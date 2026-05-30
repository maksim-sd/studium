import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useUserStore } from "../store/UserStore"
import { useTechnologiesStore } from "../store/TechnologiesStore"
import { useProjectCategoryStore } from "../store/ProjectCategoryStore"
import { useOrganizationStore } from "../store/OrganizationStore"

function LoginPage () {
    const isAuth = useUserStore((state) => state.isAuth)
    const navigate = useNavigate()

    const fetchUser = useUserStore((state) => state.fetchUser)
    const fetchTechnologies = useTechnologiesStore((state) => state.fetchTechnologies)
    const fetchProjectCategories = useProjectCategoryStore((state) => state.fetchCategories)
    const fetchOrganizations = useOrganizationStore((state) => state.fetchOrganizations)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const credentials = btoa(unescape(encodeURIComponent(`${email}:${password}`)))

    const handleSubmitLogin = async (event) => {
        event.preventDefault()

        const response = await fetchUser(credentials)
        if (response) {
            await Promise.all([
                fetchTechnologies(credentials),
                fetchProjectCategories(credentials),
                fetchOrganizations(credentials),
            ])
            navigate('/profile')
            toast.success("Вы успешно вошли в свою учетную запись!")
        } else {
            toast.error('Неправильный логин или пароль!')
        }
    }

    if (isAuth) {
        return <Navigate to='/profile' replace />
    }

    return (
        <div className="mx-62">
            <div className="flex justify-center h-[85vh] pt-45">
                <div className="outline outline-gray-300 w-[35%] h-fit p-5 rounded-md">
                    <div className="flex flex-col items-center">
                        <div className="text-xl pb-10">
                            Войти в систему
                        </div>
                        <form action="" onSubmit={handleSubmitLogin} className="flex flex-col w-[80%]">
                            <div className="flex flex-col gap-5">
                                <input 
                                    type="email" 
                                    placeholder="Электронная почта" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="p-1.25 rounded-md outline outline-gray-400 focus:outline-green-600" 
                                    required 
                                />
                                <input 
                                    type="password" 
                                    placeholder="Пароль" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="p-1.25 rounded-md outline outline-gray-400 focus:outline-green-600" 
                                    required 
                                />
                            </div>
                            <div className="pt-15 self-center text-xl">
                                <button type="submit" className="px-10 py-2 text-white bg-green-700 hover:bg-green-800 active:bg-green-900 rounded-md cursor-pointer">
                                    Войти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage