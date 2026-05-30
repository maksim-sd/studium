function FullScreenLoader () {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
                Секунду, идет загрузка...
            </p>
        </div>
    )
}

export default FullScreenLoader