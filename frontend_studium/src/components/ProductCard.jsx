function ProductCard () {
    return (
        <div className="flex flex-col gap-2.5 outline outline-gray-200 rounded-md p-5">
            <div className="flex flex-col gap-2.5 pb-20">
                <div className="font-bold text-lg">
                    Наименование товара
                </div>
                <div className="">
                    Короткое, но содержательное описание товара в несколько строк
                </div>
            </div>
            <div className="w-fit px-3 py-1.25 rounded-md text-green-700 border-2 border-green-700">
                Товар в наличии
            </div>
            <div className="font-bold py-2.5 text-lg">
                $ 20
            </div>
            <div className="cursor-pointer w-full py-2.5 rounded-md text-center text-white bg-green-700 hover:bg-green-800 active:bg-green-900">
                Обменять
            </div>
        </div>
    )
}

export default ProductCard