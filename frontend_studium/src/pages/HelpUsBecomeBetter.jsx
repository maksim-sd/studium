import { useState, useEffect, useRef } from "react"
import { requestApi } from "../api/request"
import { useUserStore } from "../store/UserStore"
import OfferCard from "../components/OfferCard"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css' 

function OfferModal ({ user, onClose }) {
    const [offerText, setOfferText] = useState('')
    const mountedRef = useRef(true)

    const handleOfferSend = async () => {
        try {
            const response = await requestApi.fetchPostRequest(offerText)
        } catch (error) {
            console.error(error.message)
        }
        onClose()
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full z-9999 bg-black/50">
            <div className="w-[90%] md:w-[35%] absolute top-[50%] left-[50%] translate-[-50%]">
                <div className="p-6.25 flex bg-white rounded-md flex-col gap-6.25">
                    <div className="flex flex-col justify-between">
                        <div onClick={onClose} className="self-end hover:font-bold cursor-pointer">
                            ✖
                        </div>
                        <div className="text-lg self-center">
                            Помогите нам стать лучше!
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm text-center">
                        Оставьте обращение к администраторам с предложениями по улучшению платформы и ее функций!
                    </div>
                    <div className="text-sm">
                        <textarea value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder='Ваше обращение...' className='p-1.25 w-full h-37.5 rounded-md outline outline-gray-200 focus:outline-green-700' name="" id=""></textarea>
                    </div>
                    <div className="text-base md:text-lg cursor-pointer rounded-md self-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900 px-6 py-1.5" onClick={() => handleOfferSend()}>
                        Отправить
                    </div>
                </div>
            </div>
            
        </div>
    )   
}

function HelpUsBecomBetter () {
    const user = useUserStore((state) => state.currentUser)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [requests, setRequests] = useState([])

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function fetchRequests(isInitial = false) {
            if (isInitial) {
                setIsLoading(true)
            }

            const data = await requestApi.fetchRequests()
            setRequests(data)

            if (isInitial) {
                setIsLoading(false)
            }
        }

        fetchRequests(true)

        const intervalId = setInterval(() => {
            fetchRequests(false)
        }, 5000)
        
        return () => clearInterval(intervalId)
    }, [])

    return (
        <>
            <div className="mx-5 md:mx-62.5">
                <div className="flex flex-col items-center gap-5">
                    <div className="text-2xl font-semibold md:text-3xl text-center">
                        Помогите нам стать лучше!
                    </div>
                    <div className="md:w-[45%] leading-normal text-center">
                        Мы стараемся сделать нашу платформу максимально удобной для использования. Ваши обращения помогают нам понять, как улучшить функционал платформы
                    </div>
                    <div className="pb-7">
                        <div onClick={() => setIsModalOpen(true)} className="px-4 py-2 cursor-pointer text-sm md:text-lg rounded-md bg-green-700 hover:bg-green-800 active:bg-green-900 text-center text-white md:mt-5">
                            Отправить обращение
                        </div>
                    </div>
                </div>
                <div className="mt-2 md:mt-0 flex flex-col gap-7.5">
                    <div className="text-lg border-b border-b-gray-300">
                        История обращений
                    </div>
                    <div className="flex flex-col gap-5">
                        {isLoading ? (
                            <div className="flex flex-col gap-5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border border-gray-200 rounded-md p-6.25">
                                        <Skeleton height={24} width="40%" className="mb-6" />
                                        <Skeleton height={16} width="80%" />
                                    </div>
                                ))}
                            </div>
                        ): (
                            requests.map((request) => (
                                <OfferCard request={request} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && <OfferModal user={user} onClose={closeModal} />}

        </>
    )
}

export default HelpUsBecomBetter