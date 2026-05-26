import { FormatDate } from '../shared/FormatDate.jsx'

function OfferCard ({ request }) {
    return (
        <div className="outline outline-gray-300 rounded-md p-6.25">
            <div className="flex flex-col">
                <div className="flex justify-between items-center pb-6 md:pb-4">
                    <div className="text-sm text-center text-gray-600">
                        Обращение от {FormatDate(request.created_at)}
                    </div>
                    <div className="outline outline-green-500 px-3 py-1 rounded-md">
                        {request.request_status}
                    </div>
                </div>
                <div className="pb-4 md:pb-2.5">
                    <span className="text-gray-600">Текст обращения:</span> {request.message}
                </div>
                {request?.answer !== null &&
                    <div className="border-t border-gray-400 pt-4 md:pt-2.5">
                        <span className="text-gray-600">Ответ от администратора:</span> {request.answer}
                    </div>
                }
            </div>
        </div>
    )
}

export default OfferCard