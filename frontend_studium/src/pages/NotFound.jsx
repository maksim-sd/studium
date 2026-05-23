import { useNavigate } from "react-router-dom"

function PageNotFound () {
    const navigate = useNavigate()

    return (
        <div className="mx-5 md:mx-62.5">
            <div className="h-[85vh] pt-45 flex flex-col items-center gap-3">
                <div className="text-8xl md:text-9xl">
                    404
                </div>
                <div className="text-base md:text-lg text-center text-gray-700">
                    Страница, которую Вы ищете, не существует либо была перемещена
                </div>
                <div className="mt-15 text-lg md:text-xl rounded-md bg-green-700 px-10 py-2 text-white hover:bg-green-800 active:bg-green-900 cursor-pointer" onClick={() => navigate('/profile')}>
                    Вернуться 
                </div>
            </div>
        </div>
    )
}

export default PageNotFound