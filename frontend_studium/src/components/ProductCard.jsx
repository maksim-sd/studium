import { shopApi } from "../api/shop"
import { cartApi } from "../api/cart"
import { useCartStore } from "../store/CartStore"

function ProductCard ({ item }) {
    const addItem = useCartStore((state) => state.addItem)
    const cart = useCartStore((state) => state.cart)

    const handleAddItem = async(productId) => {
        await addItem(productId)
    }

    return (
        <div className="flex flex-col outline outline-gray-200 rounded-md p-5">
            <div className={`w-fit px-3 py-1.25 rounded-md ml-auto bg-white ${item.product_status === "В наличии" ? "text-green-700 border-2 border-green-700" : "text-amber-600 border-2 border-amber-600"}`}>
                {item.product_status}
            </div>
            <div className="w-full h-40 overflow-hidden flex items-center justify-center my-4">
                {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-contain" /> : <div className="text-4xl pt-10">🖼️</div>}
            </div>
            <div className="flex flex-col gap-2.5 mt-auto">
                <div className="font-bold text-base">
                    {item.name}
                </div>
                <div className="text-sm">
                    {item.description}
                </div>
                <div 
                    className={`${item.product_status === "В наличии" ? "cursor-pointer text-white bg-green-700 hover:bg-green-800 active:bg-green-900" : "bg-gray-300 "}w-full py-2.5 rounded-md text-center`}
                    onClick={() => handleAddItem(item.id)}
                    disabled={item.product_status !== "В наличии"}
                >
                    {item.product_status === "В наличии" ? (
                        cart.some(elem => elem.product.id === item.id) ? (
                            <div className="">
                                Товар добавлен в корзину 
                            </div>
                        ) : (
                            `Обменять за ${item.price}🪙` 
                        )
                    ) : (
                        item.product_status
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard